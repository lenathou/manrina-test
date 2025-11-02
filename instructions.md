🔧 Tâche : extraire toute la logique “Customer” (client) depuis ApiUseCases.ts dans des use cases dédiés.

🎯 Objectif

Créer un sous-dossier usecases/ dans :

src/server/customer/

et y ajouter 5 fichiers spécialisés :

Fichier Rôle
CustomerAuthUseCases.ts Login, logout, vérification de token, changement / réinitialisation mot de passe
CustomerAccountUseCases.ts Création, mise à jour, suppression et gestion du profil client
CustomerAddressUseCases.ts Gestion des adresses clients
CustomerOrderUseCases.ts Récupération des commandes clients
CustomerWalletUseCases.ts Gestion du solde, avoirs et pagination des clients
🧩 Étapes détaillées
1️⃣ CustomerAuthUseCases.ts

Déplacer depuis ApiUseCases.ts :

customerLogin

customerLogout

verifyCustomerToken

changeCustomerPassword

requestCustomerPasswordReset

resetCustomerPassword

import { CustomerUseCases } from '@/server/customer/CustomerUseCases';
import { ReqInfos } from '@/service/BackendFetchService';

export class CustomerAuthUseCases {
constructor(private customerUseCases: CustomerUseCases) {}

async customerLogin(loginPayload, { res }: ReqInfos) {
const jwt = await this.customerUseCases.login(loginPayload);
res.setHeader('Set-Cookie', `customerToken=${jwt.jwt}; HttpOnly; Path=/; Max-Age=36000;`);
return { success: true };
}

customerLogout({ res }: ReqInfos) {
res.setHeader('Set-Cookie', 'customerToken=; HttpOnly; Path=/; Max-Age=0;');
return { success: true };
}

verifyCustomerToken({ req }: ReqInfos) {
const token = req.cookies.customerToken;
if (!token) return false;
return this.customerUseCases.verifyToken(token);
}

async changeCustomerPassword(currentPassword: string, newPassword: string, { req }: ReqInfos) {
const token = req.cookies.customerToken;
if (!token) throw new Error("Token d'authentification manquant");
const customerData = await this.customerUseCases.verifyToken(token);
if (!customerData || typeof customerData === 'boolean') throw new Error('Token invalide');
return await this.customerUseCases.changePassword(customerData.id, currentPassword, newPassword);
}

requestCustomerPasswordReset = (email: string) => this.customerUseCases.requestPasswordReset(email);
resetCustomerPassword = (token: string, newPassword: string) => this.customerUseCases.resetPassword(token, newPassword);
}

2️⃣ CustomerAccountUseCases.ts

Déplacer :

listCustomers

createCustomer

updateCustomer

deleteCustomer

listCustomersWithPagination

findCustomerByEmail

getCustomer

import { CustomerUseCases } from '@/server/customer/CustomerUseCases';

export class CustomerAccountUseCases {
constructor(private customerUseCases: CustomerUseCases) {}

listCustomers = () => this.customerUseCases.listCustomers();
createCustomer = (props) => this.customerUseCases.createCustomer(props);
updateCustomer = (props) => this.customerUseCases.updateCustomer(props);
deleteCustomer = (id: string) => this.customerUseCases.deleteCustomer(id);
listCustomersWithPagination = (options?) => this.customerUseCases.listCustomersWithPagination(options);
findCustomerByEmail = (email: string) => this.customerUseCases.findByEmail(email);
getCustomer = (id: string) => this.customerUseCases.findById(id);
}

3️⃣ CustomerAddressUseCases.ts

Déplacer :

getCustomerAddresses

createCustomerAddress

updateCustomerAddress

deleteCustomerAddress

4️⃣ CustomerOrderUseCases.ts

Déplacer :

getCustomerOrders

5️⃣ CustomerWalletUseCases.ts

Déplacer :

getCustomerWalletBalance

getCustomerWalletBalanceById

⚙️ Mise à jour de ApiUseCases.ts

Ajouter les imports :

import { CustomerAuthUseCases } from '@/server/customer/usecases/CustomerAuthUseCases';
import { CustomerAccountUseCases } from '@/server/customer/usecases/CustomerAccountUseCases';
import { CustomerAddressUseCases } from '@/server/customer/usecases/CustomerAddressUseCases';
import { CustomerOrderUseCases } from '@/server/customer/usecases/CustomerOrderUseCases';
import { CustomerWalletUseCases } from '@/server/customer/usecases/CustomerWalletUseCases';

Ajouter les propriétés privées :

private customerAuthUseCases: CustomerAuthUseCases;
private customerAccountUseCases: CustomerAccountUseCases;
private customerAddressUseCases: CustomerAddressUseCases;
private customerOrderUseCases: CustomerOrderUseCases;
private customerWalletUseCases: CustomerWalletUseCases;

Initialiser-les dans le constructeur :

this.customerAuthUseCases = new CustomerAuthUseCases(this.customerUseCases);
this.customerAccountUseCases = new CustomerAccountUseCases(this.customerUseCases);
this.customerAddressUseCases = new CustomerAddressUseCases(this.customerUseCases);
this.customerOrderUseCases = new CustomerOrderUseCases(this.customerUseCases);
this.customerWalletUseCases = new CustomerWalletUseCases(this.customerUseCases);

Supprimer toutes les définitions déplacées du bloc “Customer”.

Rediriger les appels supprimés :

public customerLogin = (payload, reqInfos) => this.customerAuthUseCases.customerLogin(payload, reqInfos);
public listCustomers = () => this.customerAccountUseCases.listCustomers();
public getCustomerWalletBalance = (reqInfos) => this.customerWalletUseCases.getCustomerWalletBalance(reqInfos);
public getCustomerAddresses = (context?, maybe?) => this.customerAddressUseCases.getCustomerAddresses(context, maybe);

✅ Résultat attendu :

ApiUseCases.ts ne contient plus de logique “Customer”.

Tous les use cases du domaine “Customer” sont regroupés sous :

src/server/customer/usecases/
├── CustomerAuthUseCases.ts
├── CustomerAccountUseCases.ts
├── CustomerAddressUseCases.ts
├── CustomerOrderUseCases.ts
├── CustomerWalletUseCases.ts

Aucune régression fonctionnelle.

L’organisation suit désormais le même modèle que admin/ et grower/.

🧾 À fournir à la fin :

Les 5 nouveaux fichiers complets.

Le diff des modifications dans ApiUseCases.ts.

Confirmation que le projet compile sans erreur TypeScript.
