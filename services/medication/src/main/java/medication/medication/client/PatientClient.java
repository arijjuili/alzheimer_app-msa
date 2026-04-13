package medication.medication.client;

import java.util.UUID;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import medication.medication.dto.PatientDto;

@FeignClient(name = "patient-service")
public interface PatientClient {

    @GetMapping("/api/v1/patients/{patientId}")
    PatientDto getPatientById(@PathVariable UUID patientId);
}
