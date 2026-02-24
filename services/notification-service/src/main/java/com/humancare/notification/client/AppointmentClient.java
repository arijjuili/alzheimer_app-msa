package com.humancare.notification.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import com.humancare.notification.dto.AppointmentDto;

@FeignClient(name = "appointments-service")
public interface AppointmentClient {

    @GetMapping("/api/appointments/upcoming")
    List<AppointmentDto> getUpcomingAppointments();
}
