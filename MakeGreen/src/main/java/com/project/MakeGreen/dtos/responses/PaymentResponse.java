package com.project.MakeGreen.dtos.responses;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private UUID donThueId;
    private String paymentUrl;
}