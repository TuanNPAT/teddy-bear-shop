package com.example.teddybearshop;

import com.example.teddybearshop.configuration.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TeddyBearShopApplication {
//    http://localhost:8080/teddy-bear-shop/swagger-ui/index.html#/

    public static void main(String[] args) {
        DotenvLoader.loadEnv();
        SpringApplication.run(TeddyBearShopApplication.class, args);
    }
}
