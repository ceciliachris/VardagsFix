package com.vardagsfix.vardagsfix;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
		"jwt.secret=test-secret-key-for-integration-tests-that-is-long-enough",
		"spring.datasource.url=jdbc:h2:mem:vardagsfix-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop"
})
class VardagsfixApplicationTests {

	@Test
	void contextLoads() {
	}
}