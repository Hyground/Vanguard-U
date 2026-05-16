package com.vanguard.studentenrollment.infrastructure.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "vanguard.enrollment.exchange";
    public static final String QUEUE = "vanguard.enrollment.billing.queue";
    public static final String ROUTING_KEY = "enrollment.created";

    @Bean
    public TopicExchange enrollmentExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue billingQueue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public Binding binding(Queue billingQueue, TopicExchange enrollmentExchange) {
        return BindingBuilder.bind(billingQueue).to(enrollmentExchange).with(ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter producerJackson2MessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
