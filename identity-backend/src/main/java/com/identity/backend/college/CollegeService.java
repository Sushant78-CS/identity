package com.identity.backend.college;
import com.identity.backend.college.dto.CollegeResponse;
import com.identity.backend.college.dto.CreateCollegeRequest;

import com.identity.backend.college.dto.UpdateCollegeRequest;
import com.identity.backend.college.dto.UpdateCollegeStatusRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CollegeService {

    private final CollegeRepository collegeRepository;

    public CollegeService(CollegeRepository collegeRepository) {
        this.collegeRepository = collegeRepository;
    }

    @Transactional
    public CollegeResponse createCollege(CreateCollegeRequest request) {

        String code = request.code().trim().toUpperCase();

        if (collegeRepository.existsByCode(code)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A college with this code already exists"
            );
        }

        College college = College.builder()
                .code(code)
                .name(request.name().trim())
                .address(request.address())
                .city(request.city())
                .state(request.state())
                .country(request.country())
                .officialEmail(request.officialEmail())
                .contactNumber(request.contactNumber())
                .websiteUrl(request.websiteUrl())
                .status(CollegeStatus.PENDING)
                .build();

        College savedCollege = collegeRepository.save(college);

        return mapToResponse(savedCollege);
    }

    @Transactional(readOnly = true)
    public Page<CollegeResponse> getAllColleges(Pageable pageable) {

        return collegeRepository
                .findAll(pageable)
                .map(this::mapToResponse);
    }


    @Transactional(readOnly = true)
    public CollegeResponse getCollegeById(Long id) {

        College college = collegeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "College not found with ID: " + id
                ));

        return mapToResponse(college);
    }


    @Transactional
    public CollegeResponse updateCollege(
            Long id,
            UpdateCollegeRequest request
    ) {
        College college = collegeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "College not found with ID: " + id
                ));

        if (college.getStatus() == CollegeStatus.INACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An inactive college cannot be updated"
            );
        }

        college.setName(request.name().trim());
        college.setAddress(request.address());
        college.setCity(request.city());
        college.setState(request.state());
        college.setCountry(request.country());
        college.setOfficialEmail(request.officialEmail());
        college.setContactNumber(request.contactNumber());
        college.setWebsiteUrl(request.websiteUrl());

        College updatedCollege = collegeRepository.save(college);

        return mapToResponse(updatedCollege);
    }

    @Transactional
    public void deleteCollege(Long id) {

        College college = collegeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "College not found with ID: " + id
                ));

        if (college.getStatus() == CollegeStatus.INACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "College is already inactive"
            );
        }

        college.setStatus(CollegeStatus.INACTIVE);

        collegeRepository.save(college);
    }


    @Transactional
    public CollegeResponse updateCollegeStatus(
            Long id,
            UpdateCollegeStatusRequest request
    ) {
        College college = collegeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "College not found with ID: " + id
                ));

        CollegeStatus newStatus = request.status();

        if (college.getStatus() == newStatus) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "College already has status: " + newStatus
            );
        }

        college.setStatus(newStatus);

        College updatedCollege = collegeRepository.save(college);

        return mapToResponse(updatedCollege);
    }

    private CollegeResponse mapToResponse(College college) {

        return new CollegeResponse(
                college.getId(),
                college.getCode(),
                college.getName(),
                college.getAddress(),
                college.getCity(),
                college.getState(),
                college.getCountry(),
                college.getOfficialEmail(),
                college.getContactNumber(),
                college.getWebsiteUrl(),
                college.getStatus().name(),
                college.getCreatedAt()
        );
    }
}
