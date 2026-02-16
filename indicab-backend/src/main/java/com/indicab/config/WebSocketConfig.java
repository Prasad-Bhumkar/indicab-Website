package com.indicab.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket Configuration for Real-Time Ride Tracking
 * 
 * Enables STOMP protocol over WebSocket for live ride position updates.
 * 
 * Topics:
 * - /topic/ride/{rideId} : Broadcast ride updates to all subscribers
 * - /topic/rides/active : Broadcast active rides list
 * - /queue/user/{userId} : Send private messages to specific user
 * 
 * Client should subscribe to:
 * - /topic/ride/123 (to track ride 123)
 * - /topic/rides/active (to see list of active rides)
 * 
 * Server sends messages to:
 * - /topic/ride/{rideId} with RideTrackingUpdate objects
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory message broker
        // For production with multiple instances, use external broker (RabbitMQ, ActiveMQ)
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint for clients to connect
        registry.addEndpoint("/ws/ride")
                .setAllowedOrigins("*")  // Update with specific origins in production
                .withSockJS();  // Enable SockJS fallback for browsers that don't support WebSocket
    }
}
