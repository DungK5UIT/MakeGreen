package com.project.MakeGreen.services;

import com.project.MakeGreen.models.SuCo;
import com.project.MakeGreen.models.Xe;
import com.project.MakeGreen.repositories.SuCoRepository;
import com.project.MakeGreen.repositories.XeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SuCoService {

    private static final Logger logger = LoggerFactory.getLogger(SuCoService.class);

    @Autowired
    private SuCoRepository suCoRepository;

    @Autowired
    private XeRepository xeRepository;

    @Transactional
    public SuCo ghiSuCo(UUID xeId, UUID nguoiBaoCaoId, String mucDo, String moTa) {
        Xe xe = xeRepository.findById(xeId)
                .orElseThrow(() -> new RuntimeException("Xe not found with id: " + xeId));

        SuCo suCo = SuCo.builder()
                .xe(xe)
                .mucDo(mucDo)
                .moTa(moTa)
                .build();

        SuCo savedSuCo = suCoRepository.save(suCo);
        logger.info("Ghi su_co thanh cong cho xe {} voi id: {}", xeId, savedSuCo.getId());

        return savedSuCo;
    }
}