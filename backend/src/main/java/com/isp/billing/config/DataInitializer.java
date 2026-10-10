package com.isp.billing.config;

import com.isp.billing.dto.CreateEquipmentRequest;
import com.isp.billing.dto.CreateResellerRequest;
import com.isp.billing.dto.CreateServiceTicketRequest;
import com.isp.billing.dto.CreateSubscriberRequest;
import com.isp.billing.dto.WalletDepositRequest;
import com.isp.billing.entity.*;
import com.isp.billing.repository.*;
import com.isp.billing.service.BillingService;
import com.isp.billing.service.EquipmentService;
import com.isp.billing.service.ResellerService;
import com.isp.billing.service.ServiceTicketService;
import com.isp.billing.service.SubscriberService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ResellerRepository resellerRepository;
    private final InternetPackageRepository packageRepository;
    private final PasswordEncoder passwordEncoder;
    private final ResellerService resellerService;
    private final SubscriberService subscriberService;
    private final BillingService billingService;
    private final EquipmentService equipmentService;
    private final ServiceTicketService serviceTicketService;

    public DataInitializer(UserRepository userRepository,
                           ResellerRepository resellerRepository,
                           InternetPackageRepository packageRepository,
                           PasswordEncoder passwordEncoder,
                           ResellerService resellerService,
                           SubscriberService subscriberService,
                           BillingService billingService,
                           EquipmentService equipmentService,
                           ServiceTicketService serviceTicketService) {
        this.userRepository = userRepository;
        this.resellerRepository = resellerRepository;
        this.packageRepository = packageRepository;
        this.passwordEncoder = passwordEncoder;
        this.resellerService = resellerService;
        this.subscriberService = subscriberService;
        this.billingService = billingService;
        this.equipmentService = equipmentService;
        this.serviceTicketService = serviceTicketService;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Super Admin if not present
        if (userRepository.findByUsername("superadmin").isEmpty()) {
            User superAdmin = new User(
                    "superadmin",
                    passwordEncoder.encode("Password@123"),
                    "Platform Super Admin",
                    "superadmin@ispbilling.com",
                    "+8801700000000",
                    Role.ROLE_SUPER_ADMIN,
                    null
            );
            userRepository.save(superAdmin);
            log.info("Initialized default Super Admin user: superadmin / Password@123");
        }

        // 2. Seed default Reseller Workspace if no resellers exist
        if (resellerRepository.count() == 0) {
            log.info("Seeding initial Reseller Workspace 'Apex Broadband'...");

            CreateResellerRequest apexReq = new CreateResellerRequest();
            apexReq.setName("Apex Broadband Solutions");
            apexReq.setCode("apex");
            apexReq.setContactPerson("Mahmud Hasan");
            apexReq.setPhone("+8801811223344");
            apexReq.setEmail("mahmud@apexbb.com");
            apexReq.setAddress("House 12, Road 4, Sector 7, Uttara, Dhaka");
            apexReq.setMotherIspName("Summit Communications / Mother Telecom");
            apexReq.setMotherIspDisbursementPercentage(new BigDecimal("49.00")); // Configured 49% disbursement to mother ISP
            apexReq.setAdminUsername("reseller_apex");
            apexReq.setAdminPassword("Password@123");
            apexReq.setAdminFullName("Apex Network Administrator");

            resellerService.createReseller(apexReq);
            Reseller apexReseller = resellerRepository.findByCode("apex").orElseThrow();

            List<InternetPackage> packages = packageRepository.findByResellerId(apexReseller.getId());
            InternetPackage pkg20 = packages.get(0);
            InternetPackage pkg40 = packages.get(1);
            InternetPackage pkg80 = packages.get(2);

            // Create sample subscriber 1 (Joined with advance wallet payment)
            CreateSubscriberRequest sub1 = new CreateSubscriberRequest();
            sub1.setName("Tanvir Ahmed");
            sub1.setPhone("+8801712345678");
            sub1.setEmail("tanvir@gmail.com");
            sub1.setAddress("Plot 24, Block C, Uttara");
            sub1.setPackageId(pkg40.getId()); // 1200 BDT
            sub1.setJoinDate(LocalDate.now().minusMonths(2).withDayOfMonth(15)); // Joined 2 months ago on 15th
            sub1.setInitialDeposit(new BigDecimal("3000.00")); // Paid 3000 in advance
            sub1.setPppoeUsername("tanvir_u15");
            sub1.setPppoePassword("tanvir123");
            sub1.setIpAddress("172.16.10.15");
            sub1.setNotes("High priority client, paid 3 months in advance");
            var dto1 = subscriberService.createSubscriber(apexReseller, sub1);

            // Create sample subscriber 2 (Standard monthly payment)
            CreateSubscriberRequest sub2 = new CreateSubscriberRequest();
            sub2.setName("Rashidul Islam");
            sub2.setPhone("+8801912345679");
            sub2.setEmail("rashidul@yahoo.com");
            sub2.setAddress("House 5, Road 2, Sector 3, Uttara");
            sub2.setPackageId(pkg20.getId()); // 800 BDT
            sub2.setJoinDate(LocalDate.now().minusMonths(1).withDayOfMonth(5)); // Joined last month on 5th
            sub2.setInitialDeposit(new BigDecimal("800.00"));
            sub2.setPppoeUsername("rashidul_u05");
            sub2.setPppoePassword("rashidul123");
            sub2.setIpAddress("172.16.10.20");
            sub2.setNotes("Home user");
            var dto2 = subscriberService.createSubscriber(apexReseller, sub2);

            // Create sample subscriber 3 (Delayed payment / wallet due)
            CreateSubscriberRequest sub3 = new CreateSubscriberRequest();
            sub3.setName("CyberSpace Gaming Lounge");
            sub3.setPhone("+8801612345680");
            sub3.setEmail("contact@cyberspace.bd");
            sub3.setAddress("Level 3, North Tower, Uttara");
            sub3.setPackageId(pkg80.getId()); // 2000 BDT
            sub3.setJoinDate(LocalDate.now().minusDays(10));
            sub3.setInitialDeposit(BigDecimal.ZERO); // No advance payment yet
            sub3.setPppoeUsername("cyberspace_gg");
            sub3.setPppoePassword("gglounge2026");
            sub3.setIpAddress("172.16.10.50");
            sub3.setNotes("Payment promised by month end (delayed payment)");
            var dto3 = subscriberService.createSubscriber(apexReseller, sub3);

            // 5. Seed Equipment (Expense #2)
            CreateEquipmentRequest eq1 = new CreateEquipmentRequest();
            eq1.setName("TP-Link Archer C6 AC1200 Gigabit Router");
            eq1.setItemType("ROUTER");
            eq1.setSerialNumber("TPL-C6-88492");
            eq1.setPurchaseCost(new BigDecimal("2350.00")); // Reseller expense
            eq1.setPurchaseDate(LocalDate.now().minusDays(20));
            eq1.setSubscriberId(dto1.getId());
            eq1.setBilledToSubscriber(true);
            eq1.setCustomerBilledAmount(new BigDecimal("2600.00"));
            eq1.setCustomerPaidAmount(new BigDecimal("2600.00")); // Subscriber paid for router
            eq1.setStatus("DEPLOYED");
            equipmentService.createEquipment(apexReseller, eq1);

            CreateEquipmentRequest eq2 = new CreateEquipmentRequest();
            eq2.setName("Huawei EchoLife HG8310M GPON ONU");
            eq2.setItemType("ONU");
            eq2.setSerialNumber("HW-GPON-44102");
            eq2.setPurchaseCost(new BigDecimal("1150.00")); // Reseller expense
            eq2.setPurchaseDate(LocalDate.now().minusDays(15));
            eq2.setSubscriberId(dto2.getId());
            eq2.setBilledToSubscriber(false); // Reseller absorbed cost for promotion!
            eq2.setCustomerBilledAmount(BigDecimal.ZERO);
            eq2.setCustomerPaidAmount(BigDecimal.ZERO);
            eq2.setStatus("DEPLOYED");
            equipmentService.createEquipment(apexReseller, eq2);

            CreateEquipmentRequest eq3 = new CreateEquipmentRequest();
            eq3.setName("100m Optical Drop Cable + Fast Connectors");
            eq3.setItemType("OPTICAL_FIBER");
            eq3.setSerialNumber("FBR-ROLL-09");
            eq3.setPurchaseCost(new BigDecimal("650.00")); // Reseller expense
            eq3.setPurchaseDate(LocalDate.now().minusDays(5));
            eq3.setStatus("IN_STOCK");
            equipmentService.createEquipment(apexReseller, eq3);

            // 6. Seed Physical Service Tickets (Expense #3)
            CreateServiceTicketRequest tck1 = new CreateServiceTicketRequest();
            tck1.setSubscriberId(dto1.getId());
            tck1.setIssueType("FIBER_CUT");
            tck1.setDescription("Sub-station cable snagged by municipal construction; physical fiber joint cut");
            tck1.setTechnicianName("Rafiqul Alam (Sr. Splicer)");
            tck1.setOperationalCost(new BigDecimal("450.00")); // Reseller expense for transport and splicing
            tck1.setStatus("RESOLVED");
            tck1.setResolutionNotes("Re-spliced optical core; optical loss measured at -18.2 dBm. Connection restored.");
            serviceTicketService.createServiceTicket(apexReseller, tck1);

            CreateServiceTicketRequest tck2 = new CreateServiceTicketRequest();
            tck2.setSubscriberId(dto3.getId());
            tck2.setIssueType("ROUTER_CONFIG");
            tck2.setDescription("Port forwarding and bandwidth queue adjustment for tournament server");
            tck2.setTechnicianName("Kawsar Ahmed");
            tck2.setOperationalCost(new BigDecimal("200.00")); // Transport allowance
            tck2.setStatus("RESOLVED");
            tck2.setResolutionNotes("Configured MikroTik queues and static route for latency reduction.");
            serviceTicketService.createServiceTicket(apexReseller, tck2);

            log.info("Finished seeding initial data for Apex Broadband.");
        }
    }
}
