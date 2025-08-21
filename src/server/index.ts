import { NotificationManager } from '@/pwa/actions';
import { AirtableService } from '@/service/airtable';
import { FileSystemService } from '@/service/FileSystemService';
import { AdminRepositoryPrismaImplementation } from '@/server/admin/AdminRepositoryPrismaImplementation';
import { AdminUseCases } from '@/server/admin/AdminUseCases';
import { ApiUseCases } from '@/server/ApiUseCases';
import { CheckoutRepositoryPrismaImplementation } from '@/server/checkout/CheckoutRepositoryPrismaImplementation';
import { CheckoutUseCases } from '@/server/checkout/CheckoutUseCases';
import { CustomerRepositoryPrismaImplementation } from '@/server/customer/CustomerRepositoryPrismaImplementation';
import { CustomerUseCases } from '@/server/customer/CustomerUseCases';
import { prisma } from '@/server/database/prisma';
import { DelivererRepositoryPrismaImplementation } from '@/server/deliverer/DelivererRepositoryPrismaImplementation';
import { DelivererUseCases } from '@/server/deliverer/DelivererUseCases';
import { PaymentUseCases } from '@/server/payment/PaymentUseCases';
import { StripeServiceImplementation } from '@/server/payment/StripeServiceImplementation';
import { ProductHistoryRepositoryPrismaImplementation } from '@/server/product/ProductHistoryRepository';
import { ProductRepositoryPrismaImplementation } from '@/server/product/ProductRepositoryPrismaImplementation';
import { ProductUseCases } from '@/server/product/ProductUseCases';
import { JwtService } from '@/server/services/JwtService';
import { PasswordService } from '@/server/services/PasswordService';
import { EmailService } from '@/server/services/EmailService';
import { StockRepositoryPrismaImplementation } from '@/server/stock/StockRepositoryPrismaImplementation';
import { StockUseCases } from '@/server/stock/StockUseCases';
import { GrowerRepositoryPrismaImplementation } from '@/server/grower/GrowerRepositoryPrismaImplementation';
import { GrowerUseCases } from '@/server/grower/GrowerUseCases';
import { PanyenRepositoryPrismaImplementation } from '@/server/panyen/PanyenRepositoryPrismaImplementation';
import { PanyenUseCases } from '@/server/panyen/PanyenUseCases';
import { MarketAnnouncementRepositoryPrismaImplementation } from '@/server/market/MarketAnnouncementRepositoryPrismaImplementation';
import { MarketUseCases } from '@/server/market/MarketUseCases';

const stripeService = new StripeServiceImplementation(process.env.STRIPE_SECRET_KEY as string);
const airtableService = new AirtableService(process.env.AIRTABLE_TOKEN as string);
const fileSystemService = new FileSystemService();

const productRepository = new ProductRepositoryPrismaImplementation(prisma);
const productHistoryRepository = new ProductHistoryRepositoryPrismaImplementation(prisma);

// Panyen repository needed by ProductUseCases
const panyenRepository = new PanyenRepositoryPrismaImplementation(prisma);

const productUseCases = new ProductUseCases(
    productRepository,
    productHistoryRepository,
    airtableService,
    fileSystemService,
    panyenRepository,
);

const stockRepository = new StockRepositoryPrismaImplementation(prisma);
const checkoutRepository = new CheckoutRepositoryPrismaImplementation(prisma);
const stockUseCases = new StockUseCases(stockRepository);

// Services that need to be instantiated first
const jwtService = new JwtService();
const passwordService = new PasswordService();
const emailService = new EmailService();

// Customer services and repositories
const customerRepository = new CustomerRepositoryPrismaImplementation(prisma, passwordService);
const customerUseCases = new CustomerUseCases(customerRepository, jwtService, checkoutRepository, emailService);

const checkoutUseCases = new CheckoutUseCases(
    checkoutRepository, 
    stockUseCases, 
    customerRepository,
    productUseCases 
);

export const paymentUseCases = new PaymentUseCases(stripeService, checkoutUseCases);

// Export repositories
export { growerRepository };
const notificationManager = new NotificationManager();

// Admin services and repositories
const adminRepository = new AdminRepositoryPrismaImplementation(prisma, passwordService);
const adminUseCases = new AdminUseCases(adminRepository, jwtService);

// Grower services and repositories
const growerRepository = new GrowerRepositoryPrismaImplementation(prisma, passwordService);
const growerUseCases = new GrowerUseCases(growerRepository, jwtService, emailService);

// Deliverer services and repositories
const delivererRepository = new DelivererRepositoryPrismaImplementation(prisma, passwordService);
const delivererUseCases = new DelivererUseCases(delivererRepository, jwtService);

// Panyen use cases (repository already created above)
const panyenUseCases = new PanyenUseCases(panyenRepository);

// Market repository and use cases
const marketAnnouncementRepository = new MarketAnnouncementRepositoryPrismaImplementation(prisma);
const marketUseCases = new MarketUseCases(marketAnnouncementRepository);

export const apiUseCases = new ApiUseCases(
    paymentUseCases,
    productUseCases,
    stockUseCases,
    checkoutUseCases,
    notificationManager,
    adminUseCases,
    growerUseCases,
    delivererUseCases,
    customerUseCases,
    panyenUseCases,
    marketUseCases,
);