package com.identity.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;

@SpringBootApplication
@EnableScheduling
@EnableSpringDataWebSupport(
		pageSerializationMode = PageSerializationMode.VIA_DTO
)
public class IdentityBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(IdentityBackendApplication.class, args);
	}

}
