package com.isp.billing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IspBillingApplication {

    public static void main(String[] args) {
        SpringApplication.run(IspBillingApplication.class, args);
    }
}
