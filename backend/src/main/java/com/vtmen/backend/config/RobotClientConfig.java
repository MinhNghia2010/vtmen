package com.vtmen.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({RobotTaskProperties.class, DcsApiProperties.class})
public class RobotClientConfig {

    @Bean
    public RestClient robotRestClient() {
        return RestClient.create();
    }
}
