# Angular Frontend Exploration - Complete Migration Reference

## 1. ROUTING STRUCTURE

### Front Routes (Public Pages) - `FrontRoutesModule`
All wrapped in `FrontLayoutComponent`:
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomepageComponent` | Landing page with banners, product carousel, MLM info |
| `/feature` | `FeatureComponent` | Features page |
| `/compensation` | `CompensationComponent` | Compensation plan |
| `/work` | `WorkComponent` | How it works |
| `/contact` | `ContactComponent` | Contact form |
| `/products/:name` | `ProductPageComponent` | Products by category |
| `/product/view/:id` | `ProductViewComponent` | Single product detail |
| `/product/checkout` | `FrontCheckoutComponent` | Guest checkout |
| `/manual/checkout` | `ManualCheckoutComponent` | Manual order checkout |
| `/productname` | `ProductnamePageComponent` | Product name page |
| `/about` | `AboutUsComponent` | About us page |
| `/discountpartners` | `PartnersPageComponent` | Discount partners |
| `/store` | `StoreComponent` | Store front |
| `/policies/:policy` | `ShippingComponent` | Shipping/policies |
| `/store/link/:slot_no` | `StoreLinkComponent` | Replicated store link |
| `/products` | `ProductsComponent` | All products listing |
| `/legalities` | `LegalitiesComponent` | Legal info |
| `/membership` | `MembershipComponent` | Membership packages |
| `/privacy-policy` | `PrivacyPolicyComponent` | Privacy policy |

**Outside layout (no header/footer):**
| Route | Component |
|-------|-----------|
| `/transaction/success` | `TransactionSuccessComponent` |
| `/transaction/failed` | `TransactionFailedComponent` |
| `/transaction/pending` | `TransactionPendingComponent` |

### Member Routes - `MemberRoutesModule`
Under `MemberLayoutComponent` (authenticated):
| Route | Component |
|-------|-----------|
| `/member` | `MemberDashboardComponent` |
| `/member/dashboard` | `MemberDashboardComponent` |
| `/member/cash-in` | `MemberCashInComponent` |
| `/member/cash-out` | `MemberCashOutComponent` |
| `/member/codevault` | `MemberCodevaultComponent` |
| `/member/sponsor` | `MemberSponsorComponent` |
| `/member/genealogy` | `MemberGenealogyComponent` |
| `/member/shopping` | `MemberShoppingComponent` |
| `/member/shopping/product/:id` | `MemberShoppingViewComponent` |
| `/member/earning` | `MemberEarningComponent` |
| `/member/checkout` | `MemberCheckoutComponent` |
| `/member/investment` | `MemberInvestmentComponent` |
| `/member/eloading` | `MemberEloadingComponent` |
| `/member/initialize` | `MemberInitializeComponent` |
| `/member/notify` | `MemberNotifyComponent` |
| `/member/watch_video` | `MemberWatchVideoComponent` |
| `/member/survey` | `MemberSurveyComponent` |
| `/member/marketing/materials` | `MemberMarketingMaterialsComponent` |
| `/member/livestream` | `MemberLivestreamComponent` |
| `/member/leaderboard` | `MemberLeaderboardComponent` |
| `/member/email/verification` | `MemberEmailVerificationComponent` |
| `/member/reward-points` | `MemberRewardPointsComponent` |
| `/member/incentive` | `MemberIncentiveComponent` |
| `/member/slot` | `MemberSlotComponent` |
| `/member/member-achievers-requirements` | `MemberAchieversRequirementsComponent` |

**Member Settings (nested):**
| Route | Component |
|-------|-----------|
| `/member/settings` | redirects to `/member/settings/profile` |
| `/member/settings/profile` | `MemberProfileComponent` |
| `/member/settings/addresses` | `MemberProfileComponent` |
| `/member/settings/password` | `MemberProfileComponent` |
| `/member/settings/order` | `MemberOrderComponent` |

**Outside layout (auth pages):**
| Route | Component |
|-------|-----------|
| `/member/maintenance` | `MemberMaintenanceComponent` |
| `/member/login` | `MemberLoginComponent` |
| `/member/register` | `MemberRegisterComponent` |
| `/member/register_retailer/:dealers_code` | `MemberRegisterRetailerComponent` |
| `/member/referral/link/:slot_referral` | `MemberReferralComponent` |
| `/member/product/link/:slot_referral` | `MemberProductLinkComponent` |
| `/member/product/link/:slot_referral/:product_id` | `MemberProductLinkComponent` |
| `/member/forgot/password` | `MemberForgotPasswordComponent` |
| `/member/create/password/:id` | `MemberCreatePasswordComponent` |
| `/member/email/activated/:code/:id` | `MemberEmailActivatedComponent` |
| `/member/register/referral/:slot_no` | `MemberRegisterReferralComponent` |

### Admin Routes - `MainRoutingModule`
Under `MainLayoutComponent` (~35 routes including):
- `/admin/dashboard`, `/admin/member`, `/admin/products`, `/admin/payouts`
- `/admin/orders`, `/admin/settings`, `/admin/vouchers`, `/admin/surveys`
- Various sub-routes for management

### Cashier Routes
| Route | Component |
|-------|-----------|
| `/cashier/` | `CashierDashboardComponent` |
| `/cashier/dashboard` | `CashierDashboardComponent` |

---

## 2. LAYOUT SYSTEM

### Front Layout (`FrontLayoutComponent`)
- **Header**: Sticky top nav, shrinks on scroll (80px → 60px)
  - Logo (left), nav links (Home, Shop, About Us, Contact Us, Register), Login button
  - Mobile: hamburger menu with full-screen overlay
- **Cart**: Floating cart button (bottom-right corner) with modal popup
  - Cookie-based cart system (`items` cookie, 30-day expiry)
  - Cart items stored as array of item IDs in cookie
- **Footer**: Logo, menu links, policies, contact info, social links
  - Company: "DOMUS NATURAE"
  - Email: domusnaturae.order@gmail.com
  - Address: Brgy. Subagan, Licuan-Baay, Abra
  - Globe: 0927-619-3081, Smart: 0928-941-7701
  - Social: Facebook, Instagram, YouTube

### Member Layout (`MemberLayoutComponent`, 957 lines)
- **Auth Guard**: Redirects to `/member/login` if no `auth` in localStorage
  - Redirects to `/` if `type` != 'member'
  - Starts `IdleService` on auth
- **Sidebar**: 260px desktop sidebar (push menu on mobile)
  - Nav items conditionally shown based on `module_settings` and `verified` status
  - Items: Dashboard, Live Stream, Leaderboard, Transaction Summary, Achievers Requirements, Marketing Materials, Top-up, Withdraw, Code & Pin, Genealogy, Referrals, Reward Points, Incentive Reward, E-commerce, My Order, Logout
- **Shopping Cart Modal**: With wallet type toggle (PHP/GC)
- **Slot Management**: Create/activate slots, manage unplaced slots
- **Replicated Links**: Member referral link + product link
- **Initialize Flow**: On first load → `/member/initialize` → email verification check → slot check → dashboard

---

## 3. SERVICES

### UserService (`user.service.ts`)
```typescript
domain = 'localhost:8000'  // dev
domain = 'https://prod-api.travelconnectph.com'  // prod
urlOrigin = window.location.origin

// Methods:
getAccessToken(body) → POST /oauth/token
getUserData(accessToken) → GET /api/user_data (Bearer auth)
getClientSecret(body) → POST /api/client_secret
uploadImage(formData) → POST /api/image/upload
uploadVideo(formData) → POST /api/video/upload
getServiceCharge(body) → POST /api/service/charge

// Helper methods:
findObjectByKey(array, key, value) → finds object in array
filterArrayByKey(array, key, value) → filters array
sumArrayByKey(array, key) → sums numeric values
```

### IdleService (`idle.service.ts`)
- 10-minute idle timeout
- Watches: click, mousemove, keydown, scroll events
- On timeout: calls `/api/logout`, clears localStorage, redirects to `/member/login`
- Cross-tab sync: sets `force-logout` in localStorage, other tabs detect via `storage` event

### ShareService (`share.service.ts`)
- Sets OpenGraph meta tags dynamically for social sharing

---

## 4. AUTHENTICATION

### OAuth2 Password Grant Flow
```
1. POST /api/client_secret → get client_secret
2. POST /oauth/token with:
   - grant_type: 'password'
   - client_id: 2
   - client_secret: (from step 1)
   - username, password
3. Store access_token in localStorage as 'auth'
4. GET /api/user_data with Bearer token
5. Store user type in localStorage as 'type' (admin/member/cashier)
6. Store member data in localStorage as 'member'
```

### Social Login (Facebook & Google)
```
Facebook App ID: 216088645731820
Google Client ID: 490702702916-a9jf6ulflqt3gqe893b2g9iig2kll8q9.apps.googleusercontent.com

Flow:
1. Social auth → get social profile data
2. POST /api/member/check_credentials with social data
3. If account exists → getClientSecret → getAccessToken → getUserData
4. If new → redirect to register with pre-filled social data
```

### LocalStorage Keys
| Key | Value |
|-----|-------|
| `auth` | OAuth access token |
| `type` | 'admin' / 'member' / 'cashier' |
| `member` | JSON member data |
| `slot_id` | Current active slot ID |
| `identification` | Random 5-char + user ID |
| `id` | Length of user ID |
| `logged_id` | User's database ID |
| `slot_referral` | Referral slot from URL |
| `slot_link` | Product link slot |
| `item_id` | Current product being viewed |
| `checkout_items` | JSON array of cart items for checkout |
| `member_branch_id` | Selected branch for shopping |
| `force-logout` | Cross-tab logout signal |
| `auto_ship_stairstep` | Auto-ship flag |

---

## 5. API ENDPOINTS (Complete List)

### Authentication & User
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/oauth/token` | Get access token |
| POST | `/api/client_secret` | Get OAuth client secret |
| GET | `/api/user_data` | Get current user data |
| POST | `/api/logout` | Logout user |
| POST | `/api/new_register` | Register new member |
| POST | `/api/check_dealers_code` | Validate dealer code |
| POST | `/api/check_sponsor` | Validate sponsor username |
| POST | `/api/get_country` | Get country list |
| POST | `/api/get_register_settings` | Get registration settings |
| POST | `/api/member/check_credentials` | Check social login credentials |

### Front/Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/load_banner` | Get homepage banners |
| POST | `/api/landing/get_category_list` | Get product categories |
| POST | `/api/landing/get_all_products` | Get all products |
| POST | `/api/landing/getProduct` | Get product by encrypted ID |
| POST | `/api/landing/getProduct_info` | Get product info |
| POST | `/api/landing/get_cart_items` | Get front cart items |
| POST | `/api/landing/submit_contact` | Submit contact form |
| POST | `/api/home/get_cart_item` | Get cart item details |
| POST | `/api/home/save_to_cart` | Save item to cart |
| POST | `/api/home/save_to_cart/atchange` | Update cart at quantity change |

### Member Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart/get_items` | Get member cart items |
| POST | `/api/cart/get_cart_items` | Get cart items by slot owner |
| POST | `/api/cart/add_to_cart` | Add item to member cart |
| POST | `/api/cart/get_front_cart` | Get front cart for member |
| POST | `/api/cart/delete_item` | Remove item from cart |

### Member Profile & Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/settings/get_user_info` | Get user info (with slot_id) |
| POST | `/api/settings/update_user_info` | Update profile info |
| POST | `/api/settings/update_changes` | Update email/phone |
| POST | `/api/settings/upload_profile` | Upload profile picture |
| POST | `/api/settings/upload_id` | Upload valid ID |
| POST | `/api/settings/get_addresses` | Get address list |
| POST | `/api/settings/add_addresses` | Add new address |
| POST | `/api/settings/update_address` | Update address |
| POST | `/api/settings/update_address_status` | Set default/delete address |
| POST | `/api/settings/get_location` | Get location data (island/region/province/city/brgy) |
| POST | `/api/settings/update_password` | Change password |
| POST | `/api/settings/add_tin` | Add TIN number |
| POST | `/api/settings/edit_tin` | Edit TIN number |
| POST | `/api/settings/kyc_front_id` | Upload KYC front ID |
| POST | `/api/settings/kyc_back_id` | Upload KYC back ID |
| POST | `/api/settings/kyc_selfie_id` | Upload KYC selfie with ID |
| POST | `/api/settings/remove_id` | Remove uploaded ID |
| POST | `/api/settings/update_beneficiary` | Update beneficiary info |
| POST | `/api/settings/close_welcome_bonus_notif` | Dismiss welcome bonus |

### Member Dashboard & Slot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/current_slot` | Get current slot info |
| POST | `/api/get_total` | Get total earnings |
| POST | `/api/slot/slot_preview` | Preview slot creation |
| POST | `/api/slot/add_slot` | Create new slot |
| POST | `/api/slot/add_slot_with_register` | Create slot + register user |
| POST | `/api/check_unplaced_slot` | Check for unplaced slots |
| POST | `/api/get_unactivated_slot` | Check unactivated slots |
| POST | `/api/settings/get_user_add_ons_info` | Get user add-ons info |

### Member Shopping
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/member/get_all_products` | Get member products |
| POST | `/api/member/get_product_link` | Get product replicated link |
| POST | `/api/member/search_product` | Search products |
| POST | `/api/shopping/get_first_category` | Get first category |
| POST | `/api/shopping/get_category_list` | Get category list |
| POST | `/api/shopping/get_subcategory_list` | Get subcategories |
| POST | `/api/shopping/get_subsub_category_list` | Get sub-subcategories |
| POST | `/api/shopping/get_sub_sub_subcategory_list` | Get sub-sub-subcategories |
| POST | `/api/getbranch_ecom` | Get e-commerce branches |

### Member Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/member/get_orders` | Get orders (all/pending/delivered/pickup/completed/cancelled) |
| POST | `/api/member/rate_item` | Rate an ordered item |
| POST | `/api/member/claim_code_claimed` | Mark claim code as claimed |
| POST | `/api/get_delivery_charge` | Get delivery charge |

### Member Genealogy
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/member/genealogy/placement` | Load binary genealogy tree |
| POST | `/api/member/genealogy/what_show` | Get genealogy display settings |
| POST | `/api/member/genealogy/unilevel` | Load unilevel genealogy |
| POST | `/api/member/genealogy/matrix` | Load matrix genealogy |
| POST | `/api/member/genealogy/board` | Load board genealogy |
| POST | `/api/member/genealogy/get_unplaced_downline_slot` | Get unplaced downlines |
| POST | `/api/member/genealogy/get_placement_downline` | Get placement downline list |
| POST | `/api/member/genealogy/get_sponsor_downline` | Get sponsor downline list |
| POST | `/api/member/genealogy/get_matrix_downline` | Get matrix downline list |
| POST | `/api/member/genealogy/place_the_downline` | Place downline in binary tree |

### Member Earnings (MLM Compensation Plans)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/member/get_plan_settings` | Get compensation plan settings |
| POST | `/api/member/get_plan_label` | Get plan labels |
| POST | `/api/member/get_eload_settings` | Get e-loading settings |
| POST | `/api/member/get_sponsor` | Get sponsor info |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/image/upload` | Upload image |
| POST | `/api/video/upload` | Upload video |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/service/charge` | Get service charge |
| GET | `/export/member_sponsor_list/pdf` | Export sponsor list as PDF |
| GET | `/export/member_sponsor_list/csv` | Export sponsor list as CSV |

---

## 6. COMPONENT DETAILS

### HomepageComponent (333 lines TS, ~600 lines HTML)
- Loads banners from API, auto-rotating carousel (5s interval)
- Sections: wellness logo, reserve/register CTA, buy package, product carousel, 3 phases (Quick Win, Lifestyle Shift, Big Glow-Up), who-this-is-for, how to join (₱2,000 starter pack), bonuses, guarantee
- Heavy MLM content about rewards circle, 10-level income system
- Cookie-based cart (same as front-layout)

### ProductsComponent (180 lines TS)
- Category filter tabs, product grid with images/prices
- Cookie-based cart, pagination for 8+ products
- API: `/api/landing/get_category_list`, `/api/landing/get_all_products`

### ProductViewComponent (337 lines TS)
- Product detail by encrypted ID from route param
- Quantity +/-, add to cart, order now buttons
- Similar products Swiper carousel
- Expandable description "Read More"

### ContactComponent
- Contact form: name, email, subject, message
- API: `/api/landing/submit_contact`
- Fallback Gmail compose link

### AboutUsComponent
- Vision/Mission sections
- Our Story: Founded 2014 in Abra, founder Charles B. Herrero, 200,000+ users
- Testimonials carousel with auto-rotation

### MemberLoginComponent (315 lines TS)
- Email + password form with show/hide toggle
- Social login (Facebook, Google)
- OAuth2 flow: getClientSecret → getAccessToken → getUserData
- Routes by user type after login
- Checks maintenance mode via `mlm_feature_enable`

### MemberRegisterComponent (~400 lines TS)
- Fields: sponsor username, username (max 15), email, first/last/middle name, contact (max 11), password, confirm
- Optional code/pin fields
- Privacy policy modal (must scroll to bottom to enable Agree button)
- Auto-login after successful registration
- Dealer code support via URL param

### MemberDashboardComponent (2378 lines TS, 2834 lines HTML)
- **Massive component** - MLM dashboard
- Displays: profile card, accumulated earnings, multiple wallet types
- Wallet types: PHP wallet, GC (Gift Certificate) wallet
- Bonus types displayed: Direct, Binary, Indirect, Unilevel, Achievers, Pass-up, Stairstep, Cashback, Marketing Support, Prime Refund, Milestone, Infinity, Welcome Bonus
- Features: replicated link copy, add member/slot, switch slot, wallet conversion
- Binary tree placement with left/right positioning

### MemberProfileComponent (1047 lines TS, 797 lines HTML)
- **Profile Image**: Upload profile picture
- **Change Password**: Current + new + confirm password form
- **Addresses**: CRUD for shipping addresses with Philippine location hierarchy (Island Group → Region → Province → City → Barangay)
  - Receiver info: name, contact number, email per address
  - Set default / delete functionality
- **KYC (Know Your Customer)**: Upload front ID, back ID, selfie with ID
  - Status: Not uploaded → Waiting for Approval → Verified / Rejected
- **Account Information**: Email (changeable with verification), phone (changeable), TIN number, gender, date of birth, store name
- **Beneficiary Information**: First/middle/last name, phone number

### MemberShoppingComponent (310 lines TS, 226 lines HTML)
- Multi-level category filter (category → subcategory → sub-subcategory → sub-sub-subcategory)
- Product grid with prices (PHP and GC currencies)
- Product type toggle: Products vs Membership Packages
- Search input with live filtering
- Add to cart + View Product Link (replicated link for sharing)
- Swiper carousel for product display
- Pagination via `ngx-pagination`

### MemberOrderComponent (200 lines TS, 492 lines HTML)
- Tab-based order management: My Orders, To Ship, To Receive, To Pickup, Completed, Cancelled
- Order detail view with item list, pricing breakdown
- Delivery tracking stepper (To Ship → To Receive → Completed)
- Claim code display and "Order Received" confirmation
- Item rating system (star ratings)
- Pricing shows: subtotal, shipping fee, delivery charge, handling fee, voucher discount, grand total
- Payment status: PAID / CASH ON DELIVERY

### MemberGenealogyComponent (1626 lines TS, 795 lines HTML)
- **Multiple genealogy views**:
  - Binary Structure (graphical tree + list + unplaced downlines)
  - Unilevel Structure
  - Matrix Structure
  - Board Structure (12 levels)
- Binary tree: Visual tree with profile pictures, hover tooltips (name, package, date joined, PV, directs)
- Left/Right point counts
- Place downline: Manual placement in binary tree with LEFT/RIGHT positioning
- Downline list tables with pagination + search + PDF export
- Add member form: Register directly under genealogy
- Drag-scroll for tree navigation

### MemberEarningComponent (1785 lines TS, 5034 lines HTML)
- **Massive earnings tracking page** with 30+ compensation plan types
- Each plan shows: icon, title, total amount, paginated transaction history table
- Plan types include:
  - DIRECT, INDIRECT, BINARY, UNILEVEL, PASS_UP, STAIRSTEP
  - CASHBACK, PERSONAL_CASHBACK, DIRECT_PERSONAL_CASHBACK
  - SHARE_LINK, SHARE_LINK_V2, PRODUCT_SHARE_LINK
  - RETAILER_COMMISSION, OVERRIDING_COMMISSION
  - PRODUCT_DIRECT_REFERRAL, PRODUCT_PERSONAL_CASHBACK
  - UNIVERSAL_POOL_BONUS, MENTORS_BONUS, WATCH_EARN
  - BOARD, MONOLINE, LEVELING_BONUS
  - GLOBAL_POOL, INCENTIVE_BONUS, LEADERSHIP_BONUS, ROYALTY_BONUS
  - BINARY_POINTS, BINARY_SLOT_LIMIT
  - TEAM_SALES_BONUS, RETAILER_OVERRIDE, DROPSHIPPING_BONUS
  - WELCOME_BONUS, ACHIEVERS_RANK
  - PRIME_REFUND, REWARD_POINTS, INCENTIVE
  - MILESTONE, INFINITY_BONUS, MARKETING_SUPPORT
  - LEADERS_SUPPORT, MARKETING_SUPPORT_DAILY_INCOME
  - REVERSE_PASS_UP, UNILEVEL_MATRIX_BONUS
- Plans are conditionally shown based on `plan_settings` flags
- Dynamic plan labels from API
- 1-second timer for countdown displays (Leaders Support bonus)

### MemberSettingsComponent (wrapper)
- Simple wrapper with `<router-outlet>` for child routes (profile, addresses, password, order)

---

## 7. STYLING FOUNDATION

### CSS Variables (`:root`)
```css
--primary-color: #124a5b;
--secondary-color: #f78d00;
--dark-mode: black;
--light-mode: white;
--danger-color: #dc3545;
--background-color: #ffffff;
--border-radius: 10px;
--transition: 0.3s ease-in-out;
```

### SCSS Variables (`_variables.scss`)
```scss
$global-font: "Montserrat", sans-serif;
$primarycolor: var(--primary-color);
$secondarycolor: var(--primary-color);
$header: var(--primary-color);
$footer: var(--primary-color);
$btn-primary: var(--primary-color);
$btn-secondary: var(--secondary-color);
$wallet: #f26e18; // orange
$dblue: #082e40;
$lblue: #1c95bc;
$orange: #f26e18;
```

### Fonts
- Primary: **Montserrat** (300, 400, 600, 700 weights)
- Display: Playfair Display SC, Playfair Display
- Body: Poppins

### Key Style Patterns
- Bootstrap 4 grid system
- Font Awesome icons
- No border-radius on inputs, selects, modals (`border-radius: 0 !important`)
- Form validation: green left border for valid, red for invalid
- Modal headers: colored background with white text
- Loading spinner animation (`@keyframes spincircle`)

---

## 8. EXTERNAL DEPENDENCIES & LIBRARIES

| Angular Library | Next.js Equivalent |
|-----------------|-------------------|
| `ngx-toastr` | `sonner` (already installed) |
| `ngx-pagination` | Custom pagination or shadcn pagination |
| `ngx-bootstrap` (dropdown, tooltip) | shadcn dropdown-menu, tooltip |
| `swiper` | `embla-carousel-react` (already installed) |
| `wow.js` | CSS animations / framer-motion |
| `jquery` | Not needed (use React state/refs) |
| `ng2-google-charts` | `recharts` (already installed) |
| `ngx-color-picker` | React color picker library |
| `ngx-youtube-player` | react-youtube or iframe |
| `ngx-skeleton-loader` | shadcn skeleton (already installed) |
| `ng-circle-progress` | CSS/SVG circle progress |
| `angular-6-social-login` | next-auth or custom OAuth |
| `ngx-drag-scroll` | react-draggable or custom |
| `alife-file-to-base64` | FileReader API |
| `bootstrap` (CSS framework) | Tailwind CSS (already installed) |
| `font-awesome` | `lucide-react` (already installed) |

---

## 9. ENVIRONMENT CONFIGURATION

### Development
```typescript
production: false
apiUrl: 'localhost:8000'
```

### Production
```typescript
production: true
apiUrl: 'https://prod-api.travelconnectph.com'
```

---

## 10. INDEX.HTML
- Fonts: Playfair Display SC, Playfair Display, Poppins (Google Fonts)
- Facebook Pixel IDs: `577837987298598`, `765864195612067`
- OG Meta: site_name="Travel Connect", type="article"
- Favicon: favicon.ico

---

## 11. DATA MODELS

### User
- `id`, `name`, `email`, `created_at`, `updated_at`

### Slot (from `/api/current_slot`)
- `slot_id`, `slot_no`, `slot_type` ('PS' for product seller)
- `slot_left_points`, `slot_right_points`
- `store_name`, `slot_encrypted`, `slot_count`
- `binary_settings` (binary_extreme_position, show_slot_tracker, show_earnings_tracker, etc.)
- `module_settings` (feature flags for sidebar navigation)
- `get_wallets` (array of wallet objects with currency info)
- `registered_as_retailer`, `replicated_sponsoring`
- `show_unilevel`, `show_matrix`
- `email_verified` (0/1)

### User Info (from `/api/settings/get_user_info`)
- Basic: `name`, `user_email`, `user_phone`, `user_password`, `contact`
- Personal: `gender`, `birth_day`, `birth_month`, `birth_year`, `tin`, `date_registered`
- Profile: `profile_picture`, `store_name`, `team_name`
- KYC: `front_id`, `back_id`, `selfie_id`, `verified` (0=not uploaded, 1=verified, 2=waiting, 3=rejected)
- Beneficiary: `beneficiary_info` { `beneficiary_name`, `beneficiary_contact` }
- Settings: `settings` object with display flags

### Address
- `address_id`, `address_postal_code`, `island_group`
- `regCode`, `provCode`, `citymunCode`, `brgyCode`
- `additional_info`, `address_info`, `barangay_city`, `region_province`
- `receiver_name`, `receiver_contact_number`, `receiver_email`
- `is_default` (0/1)

### Product
- `item_id`, `item_sku`, `item_thumbnail`
- `item_price`, `discounted_price`, `item_gc_price`
- `item_points_currency`, `item_type` ('product' / 'membership_kit')
- `item_category` ('new')
- `quantity`

### Order
- `order_number`, `order_status` (pending/delivered/pickup/completed/cancelled)
- `order_date_created`, `order_date_delivered`, `order_date_completed`
- `delivery_method` (delivery/pickup)
- `payment_method` (3=GC, 6=COD)
- `subtotal`, `shipping_fee`, `shipping_fee_v2`, `delivery_charge`, `handling_fee`, `grand_total`
- `receipt` { `claim_code`, `voucher`, `payment_method`, `claimed`, `courier`, `transaction_number` }
- `item[]` array with product details + ratings

### Wallet
- `currency_abbreviation`, `currency_buying`, `currency_default`
- Balance amounts per wallet type

---

## 12. NEXT.JS PROJECT CURRENT STATE

### Already Installed
- Next.js 16.1.6, React 19.2.3
- Tailwind CSS 4
- shadcn/ui with 55+ components (button, card, dialog, form, table, tabs, pagination, skeleton, sidebar, navigation-menu, carousel, chart, etc.)
- `sonner` (toast notifications)
- `recharts` (charts)
- `embla-carousel-react` (carousels)
- `react-hook-form` + `zod` (form validation)
- `lucide-react` (icons)
- `next-themes` (dark mode)
- `react-day-picker` (date picker)
- `input-otp` (OTP input)
- `react-resizable-panels`
- `vaul` (drawer)

### Needs to be Added
- Authentication library (next-auth or custom OAuth2)
- HTTP client wrapper (fetch/axios with token management)
- Idle timeout service
- Cookie management for guest cart
- Social login (Facebook, Google OAuth)
- Image upload handling
- Philippine address hierarchy component
- KYC upload system
- MLM genealogy tree visualization (binary, unilevel, matrix, board)

---

## 13. SUGGESTED NEXT.JS ROUTE STRUCTURE

```
app/
├── (front)/                    # Public layout group
│   ├── layout.tsx              # Front header + footer
│   ├── page.tsx                # Homepage
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── products/page.tsx
│   ├── products/[name]/page.tsx
│   ├── product/view/[id]/page.tsx
│   ├── product/checkout/page.tsx
│   ├── store/page.tsx
│   ├── store/link/[slot_no]/page.tsx
│   ├── membership/page.tsx
│   ├── policies/[policy]/page.tsx
│   ├── privacy-policy/page.tsx
│   └── legalities/page.tsx
├── (auth)/                     # Auth pages (no layout)
│   ├── member/login/page.tsx
│   ├── member/register/page.tsx
│   ├── member/forgot/password/page.tsx
│   └── member/create/password/[id]/page.tsx
├── (member)/                   # Member layout group
│   ├── layout.tsx              # Sidebar + header
│   ├── member/
│   │   ├── page.tsx            # Dashboard
│   │   ├── dashboard/page.tsx
│   │   ├── shopping/page.tsx
│   │   ├── shopping/product/[id]/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── earning/page.tsx
│   │   ├── genealogy/page.tsx
│   │   ├── cash-in/page.tsx
│   │   ├── cash-out/page.tsx
│   │   ├── codevault/page.tsx
│   │   ├── slot/page.tsx
│   │   ├── reward-points/page.tsx
│   │   ├── incentive/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── livestream/page.tsx
│   │   ├── marketing/materials/page.tsx
│   │   └── settings/
│   │       ├── layout.tsx
│   │       ├── profile/page.tsx
│   │       ├── addresses/page.tsx
│   │       ├── password/page.tsx
│   │       └── order/page.tsx
├── transaction/
│   ├── success/page.tsx
│   ├── failed/page.tsx
│   └── pending/page.tsx
├── lib/
│   ├── api.ts                  # API client with auth headers
│   ├── auth.ts                 # Auth utilities
│   ├── idle.ts                 # Idle timeout hook
│   └── cart.ts                 # Cart management (cookies for guest, API for member)
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useIdle.ts
│   └── useApi.ts
└── components/
    ├── front/                  # Front-facing components
    ├── member/                 # Member area components
    └── shared/                 # Shared components
```
