package com.identity.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public")
public class Test {

    @GetMapping("/test")
    public String testing() {
        return "Hello Sushant";
    }
}