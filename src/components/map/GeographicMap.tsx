import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import type { Recipient, PickupTask, FoodSubmission, Location } from '../../types';
import { fetchDrivingRoute } from '../../services/routing/routingService';
import { Navigation, Maximize2, Route as RouteIcon } from 'lucide-react';

interface GeographicMapProps {
  recipients?: Recipient[];
  selectedPickup?: PickupTask | null;
  submissions?: FoodSubmission[];
  selectedRecipientId?: string | null;
  onSelectRecipient?: (recipient: Recipient) => void;
  height?: string;
  className?: string;
  showAllRecipients?: boolean;
}

// Hyderabad center coordinates
const DEFAULT_CENTER: [number, number] = [17.3850, 78.4867];
const DEFAULT_ZOOM = 12;

export const GeographicMap: React.FC<GeographicMapProps> = ({
  recipients = [],
  selectedPickup,
  submissions = [],
  selectedRecipientId,
  onSelectRecipient,
  height = '420px',
  className = '',
  showAllRecipients = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMinutes: number;
    isFallback: boolean;
    providerName: string;
    recipientName: string;
    summary?: string;
  } | null>(null);

  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // Resolve Provider location & Recipient location from selected pickup or submissions
  const activeLocations = useMemo(() => {
    let providerLoc: Location | null = null;
    let recipientLoc: Location | null = null;
    let providerName = selectedPickup?.providerName || 'Food Provider';
    let recipientName = selectedPickup?.recipientName || 'NGO Recipient';

    if (selectedPickup) {
      // 1. Find matching submission for provider coordinates
      const matchedSub = submissions.find(
        s => (s.providerName && selectedPickup.providerName && s.providerName.toLowerCase() === selectedPickup.providerName.toLowerCase()) ||
             (selectedPickup.pickupAddress && s.location?.address && selectedPickup.pickupAddress.toLowerCase().includes(s.location.address.toLowerCase().slice(0, 15)))
      );
      if (matchedSub?.location && typeof matchedSub.location.lat === 'number' && typeof matchedSub.location.lng === 'number') {
        providerLoc = matchedSub.location;
      } else if (selectedPickup.pickupAddress) {
        // Fallback to known Hyderabad provider coordinates (HITEC City)
        providerLoc = {
          address: selectedPickup.pickupAddress,
          lat: 17.4483,
          lng: 78.3748
        };
      }

      // 2. Find matching recipient for recipient coordinates
      const matchedRec = recipients.find(
        r => (r.name && selectedPickup.recipientName && r.name.toLowerCase() === selectedPickup.recipientName.toLowerCase()) ||
             (selectedPickup.destinationAddress && r.location?.address && selectedPickup.destinationAddress.toLowerCase().includes(r.location.address.toLowerCase().slice(0, 15)))
      );
      if (matchedRec?.location && typeof matchedRec.location.lat === 'number' && typeof matchedRec.location.lng === 'number') {
        recipientLoc = matchedRec.location;
        recipientName = matchedRec.name;
      } else if (selectedPickup.destinationAddress) {
        // Fallback to default Hyderabad NGO coordinate (Narsingi)
        recipientLoc = {
          address: selectedPickup.destinationAddress,
          lat: 17.3753,
          lng: 78.3612
        };
      }
    } else if (selectedRecipientId) {
      const rec = recipients.find(r => r.id === selectedRecipientId);
      if (rec?.location && typeof rec.location.lat === 'number' && typeof rec.location.lng === 'number') {
        recipientLoc = rec.location;
        recipientName = rec.name;
      }
      if (submissions[0]?.location && typeof submissions[0].location.lat === 'number' && typeof submissions[0].location.lng === 'number') {
        providerLoc = submissions[0].location;
        providerName = submissions[0].providerName;
      }
    }

    return { providerLoc, recipientLoc, providerName, recipientName };
  }, [selectedPickup, selectedRecipientId, recipients, submissions]);

  // Initialize Map once
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Clean up any stale leaflet initialization on this DOM element
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    let isDisposed = false;

    const map = L.map(container, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false
    });

    // Add zoom controls to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap Standard Tiles (Zero API Key, Open Access)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size after layout stabilization
    const timer = setTimeout(() => {
      if (!isDisposed && mapInstanceRef.current) {
        map.invalidateSize();
      }
    }, 200);

    return () => {
      isDisposed = true;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersLayerRef.current = null;
      routeLayerRef.current = null;
      if (container && (container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    };
  }, []);

  // Update Markers & Route
  useEffect(() => {
    let isCancelled = false;
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !markersLayer || !routeLayer) return;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    const boundsPoints: [number, number][] = [];

    // 1. Render Real NGO Recipient Markers
    if (showAllRecipients && Array.isArray(recipients)) {
      recipients.forEach(r => {
        if (!r.location || typeof r.location.lat !== 'number' || typeof r.location.lng !== 'number' || isNaN(r.location.lat) || isNaN(r.location.lng)) {
          return;
        }

        const isDestination = activeLocations.recipientLoc &&
          ((r.location.address && activeLocations.recipientLoc.address === r.location.address) ||
           (r.name && activeLocations.recipientName && activeLocations.recipientName.toLowerCase() === r.name.toLowerCase()));

        const isHighlighted = isDestination || selectedRecipientId === r.id;

        // Custom HTML marker badge for NGO
        const needColor = r.currentNeedLevel === 'CRITICAL' ? '#ef4444' :
                          r.currentNeedLevel === 'HIGH' ? '#f59e0b' : '#3b82f6';

        const iconHtml = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: pointer;
          ">
            <div style="
              width: ${isHighlighted ? '38px' : '30px'};
              height: ${isHighlighted ? '38px' : '30px'};
              border-radius: 50%;
              background: ${isHighlighted ? '#4338ca' : '#1e1b4b'};
              border: 2px solid ${isHighlighted ? '#818cf8' : '#a5b4fc'};
              box-shadow: 0 2px 8px rgba(0,0,0,0.3)${isHighlighted ? ', 0 0 12px rgba(99,102,241,0.6)' : ''};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: ${isHighlighted ? '15px' : '12px'};
            ">
              🏛️
            </div>
            <span style="
              position: absolute;
              top: -4px;
              right: -4px;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: ${needColor};
              border: 1.5px solid white;
            "></span>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-ngo-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -18]
        });

        const marker = L.marker([r.location.lat, r.location.lng], { icon });

        // Rich interactive popup
        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #1e293b; max-width: 250px; line-height: 1.4;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
              <span style="font-size: 9px; font-weight: 700; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px;">${r.organizationType || 'NGO'}</span>
              <span style="font-size: 9px; font-weight: 700; background: ${r.currentNeedLevel === 'CRITICAL' ? '#fee2e2' : '#fef3c7'}; color: ${r.currentNeedLevel === 'CRITICAL' ? '#991b1b' : '#92400e'}; padding: 2px 6px; border-radius: 4px;">${r.currentNeedLevel || 'MEDIUM'} NEED</span>
            </div>
            <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 3px;">${r.name}</strong>
            <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">${r.location.address || 'Hyderabad'}</p>
            <div style="background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 10px; margin-bottom: 6px;">
              <div><strong>Capacity:</strong> ${r.availableCapacity || 0} meals</div>
              <div><strong>Contact:</strong> ${r.contactPerson || 'Coordinator'} (${r.phone || 'N/A'})</div>
            </div>
            ${r.sourceName ? `<div style="font-size: 9px; color: #64748b; font-style: italic;">Verified: ${r.sourceName}</div>` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onSelectRecipient) {
          marker.on('click', () => onSelectRecipient(r));
        }

        markersLayer.addLayer(marker);
        boundsPoints.push([r.location.lat, r.location.lng]);
      });
    }

    // 2. Render Food Provider Marker if active
    if (activeLocations.providerLoc && typeof activeLocations.providerLoc.lat === 'number' && typeof activeLocations.providerLoc.lng === 'number' && !isNaN(activeLocations.providerLoc.lat) && !isNaN(activeLocations.providerLoc.lng)) {
      const pLat = activeLocations.providerLoc.lat;
      const pLng = activeLocations.providerLoc.lng;

      const providerIconHtml = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
        ">
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #059669;
            border: 2px solid #34d399;
            box-shadow: 0 0 14px rgba(16,185,129,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
          ">
            🍲
          </div>
          <span style="
            position: absolute;
            bottom: -6px;
            background: #065f46;
            color: #d1fae5;
            font-size: 9px;
            font-weight: 800;
            padding: 1px 4px;
            border-radius: 4px;
            white-space: nowrap;
          ">INTAKE</span>
        </div>
      `;

      const providerIcon = L.divIcon({
        html: providerIconHtml,
        className: 'custom-provider-marker',
        iconSize: [36, 44],
        iconAnchor: [18, 22],
        popupAnchor: [0, -22]
      });

      const providerMarker = L.marker([pLat, pLng], { icon: providerIcon });
      providerMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #1e293b; max-width: 240px;">
          <span style="font-size: 9px; font-weight: 700; background: #d1fae5; color: #065f46; padding: 2px 6px; border-radius: 4px;">FOOD DONOR INTAKE</span>
          <strong style="font-size: 13px; color: #0f172a; display: block; margin: 4px 0 2px 0;">${activeLocations.providerName}</strong>
          <p style="font-size: 11px; color: #475569; margin: 0;">${activeLocations.providerLoc.address || 'Intake Point'}</p>
        </div>
      `);

      markersLayer.addLayer(providerMarker);
      boundsPoints.push([pLat, pLng]);
    }

    // 3. Fetch and Render Live Driving Route if both origin & destination exist
    if (activeLocations.providerLoc && activeLocations.recipientLoc) {
      setIsRoutingLoading(true);
      const from = activeLocations.providerLoc;
      const to = activeLocations.recipientLoc;

      fetchDrivingRoute(from, to).then(route => {
        if (isCancelled) return;
        setIsRoutingLoading(false);
        if (!mapInstanceRef.current || !routeLayerRef.current) return;

        routeLayer.clearLayers();

        if (route.coordinates.length > 0) {
          // Main route line
          const polyline = L.polyline(route.coordinates, {
            color: '#4f46e5',
            weight: 5,
            opacity: 0.85,
            dashArray: route.isFallback ? '8, 8' : undefined,
            lineCap: 'round',
            lineJoin: 'round'
          });

          // Glow backdrop line
          const glowLine = L.polyline(route.coordinates, {
            color: '#818cf8',
            weight: 8,
            opacity: 0.35,
            lineCap: 'round',
            lineJoin: 'round'
          });

          routeLayer.addLayer(glowLine);
          routeLayer.addLayer(polyline);

          // Add in-transit vehicle marker along the route at ~60% of distance
          const midIdx = Math.floor(route.coordinates.length * 0.6);
          const vehicleCoord = route.coordinates[midIdx] || route.coordinates[0];

          const vehicleIcon = L.divIcon({
            html: `
              <div style="
                background: #1e1b4b;
                border: 2px solid #818cf8;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                box-shadow: 0 0 10px rgba(99,102,241,0.8);
                cursor: pointer;
              ">
                🚐
              </div>
            `,
            className: 'vehicle-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const vehicleMarker = L.marker(vehicleCoord, { icon: vehicleIcon });
          vehicleMarker.bindPopup(`
            <div style="font-family: inherit; font-size: 11px; color: #1e293b;">
              <strong style="display: block; font-size: 12px; color: #4338ca;">Eco-Transit Van #02</strong>
              <span>Cold-Chain Transit • Speed: ~35 km/h</span>
            </div>
          `);
          routeLayer.addLayer(vehicleMarker);

          setRouteInfo({
            distanceKm: route.distanceKm,
            durationMinutes: route.durationMinutes,
            isFallback: route.isFallback,
            providerName: activeLocations.providerName,
            recipientName: activeLocations.recipientName,
            summary: route.summary
          });

          // Auto-fit map viewport to nicely frame the route with padding
          const routeBounds = polyline.getBounds();
          map.fitBounds(routeBounds, {
            padding: [40, 40],
            maxZoom: 14
          });
        }
      }).catch(() => {
        if (!isCancelled) {
          setIsRoutingLoading(false);
        }
      });
    } else {
      setRouteInfo(null);
      if (boundsPoints.length > 0) {
        map.fitBounds(boundsPoints, { padding: [30, 30], maxZoom: 13 });
      }
    }

    return () => {
      isCancelled = true;
    };
  }, [recipients, activeLocations, selectedRecipientId, showAllRecipients, onSelectRecipient]);

  // Handler to recenter to Hyderabad
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true });
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 ${className}`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Top Floating Controls & Telemetry Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md text-xs font-semibold text-slate-700 flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Hyderabad Live Geo-Redistribution Map</span>
        </div>

        {routeInfo && (
          <div className="bg-indigo-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-700 shadow-md text-xs font-semibold text-indigo-100 flex items-center space-x-2">
            <RouteIcon className="w-3.5 h-3.5 text-indigo-300" />
            <span>
              {routeInfo.distanceKm} km • ~{routeInfo.durationMinutes} mins
              {routeInfo.isFallback ? ' (Direct Geodesic)' : ' (OSRM Urban Route)'}
            </span>
          </div>
        )}
      </div>

      {/* Reset Center Button */}
      <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-2 pointer-events-auto">
        <button
          onClick={handleRecenter}
          className="bg-white/95 hover:bg-slate-100 text-slate-700 p-2 rounded-xl border border-slate-200 shadow-md transition-colors flex items-center space-x-1.5 text-xs font-semibold"
          title="Reset to Hyderabad View"
        >
          <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Recenter Hyderabad</span>
        </button>
      </div>

      {/* Bottom Route Details Banner */}
      {routeInfo && (
        <div className="absolute bottom-3 left-3 right-48 z-[1000] hidden sm:block pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md p-2.5 px-3.5 rounded-xl border border-slate-200/80 shadow-md text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <span className="font-bold text-emerald-700 truncate">{routeInfo.providerName}</span>
              <span className="text-slate-400">→</span>
              <span className="font-bold text-indigo-700 truncate">{routeInfo.recipientName}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-medium ml-2 shrink-0">
              {routeInfo.summary || `${routeInfo.distanceKm} km`}
            </span>
          </div>
        </div>
      )}

      {/* Loading Spinner for Routing */}
      {isRoutingLoading && (
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-[1001] flex items-center justify-center pointer-events-none">
          <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center space-x-2 text-xs font-semibold text-slate-700">
            <Navigation className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>Calculating live transit corridor...</span>
          </div>
        </div>
      )}
    </div>
  );
};
