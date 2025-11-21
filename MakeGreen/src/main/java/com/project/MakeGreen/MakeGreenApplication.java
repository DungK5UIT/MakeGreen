package com.project.MakeGreen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync; // <-- Import này

@SpringBootApplication
@EnableAsync
public class MakeGreenApplication {

	public static void main(String[] args) {
		System.setProperty("java.net.preferIPv4Stack", "true");
		SpringApplication.run(MakeGreenApplication.class, args);
	}

}
	