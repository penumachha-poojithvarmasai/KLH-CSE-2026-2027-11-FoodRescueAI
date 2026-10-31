package ai.foodrescue.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * FoodRescue AI - Central Eureka Service Registry &amp; Discovery Hub.
 * Manages service registration, heartbeat telemetry, and dynamic endpoint resolution for all SOA microservices.
 */
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
