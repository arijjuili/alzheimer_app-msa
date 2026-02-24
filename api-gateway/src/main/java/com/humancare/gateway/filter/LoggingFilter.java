package com.humancare.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Global logging filter for gateway requests.
 * 
 * Adds correlation ID to each request for distributed tracing.
 */
@Slf4j
@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String correlationId = exchange.getRequest().getHeaders().getFirst(CORRELATION_ID_HEADER);
        
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        final String finalCorrelationId = correlationId;
        
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
            .header(CORRELATION_ID_HEADER, finalCorrelationId)
            .build();

        ServerWebExchange mutatedExchange = exchange.mutate()
            .request(mutatedRequest)
            .build();

        long startTime = System.currentTimeMillis();
        
        log.info("[{}] {} {} - Started",
            finalCorrelationId,
            exchange.getRequest().getMethod(),
            exchange.getRequest().getURI().getPath()
        );

        return chain.filter(mutatedExchange)
            .doFinally(signalType -> {
                long duration = System.currentTimeMillis() - startTime;
                log.info("[{}] {} {} - Completed in {}ms - Status: {}",
                    finalCorrelationId,
                    exchange.getRequest().getMethod(),
                    exchange.getRequest().getURI().getPath(),
                    duration,
                    exchange.getResponse().getStatusCode()
                );
            });
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

}
