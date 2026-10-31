package ai.foodrescue.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * FoodRescue AI - Central Edge API Gateway.
 * Provides unified entrypoint (Port 8080), route dispatching, token forwarding, rate limiting, and CORS resolution.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
