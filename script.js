"use strict";

/* ==========================================
   DRIVE X - CAR RENTAL MANAGEMENT PLATFORM
   Demo application using browser localStorage
========================================== */

const $ = id => document.getElementById(id);
const money = value => "₹" + Number(value || 0).toLocaleString("en-IN");
const today = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = "driveXData_v3";

const addDays = days => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const makeId = prefix =>
  prefix + Date.now().toString().slice(-7) +
  Math.floor(Math.random() * 90 + 10);

const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

const statusHTML = status => {
  const cls = String(status).toLowerCase().replace(/\s+/g, "-");
  return `<span class="status ${escapeHTML(cls)}">${escapeHTML(status)}</span>`;
};

/* ==========================================
   MODEL CATALOGUE
   Put matching photos in assets/cars/
========================================== */

const models = [
  {brand:"BMW",name:"BMW 3 Series",category:"Luxury",price:6500,seats:5,fuel:"Petrol",transmission:"Automatic",image:"assets/cars/bmw-3-series.jpg"},
  {brand:"BMW",name:"BMW 5 Series",category:"Luxury",price:8500,seats:5,fuel:"Petrol",transmission:"Automatic",image:"assets/cars/bmw-5-series.jpg"},
  {brand:"BMW",name:"BMW X5",category:"SUV",price:11000,seats:5,fuel:"Diesel",transmission:"Automatic",image:"assets/cars/bmw-x5.jpg"},
  {brand:"Mercedes-Benz",name:"Mercedes C-Class",category:"Luxury",price:7500,seats:5,fuel:"Petrol",transmission:"Automatic",image:"assets/cars/mercedes-c-class.jpg"},
  {brand:"Mercedes-Benz",name:"Mercedes E-Class",category:"Luxury",price:9500,seats:5,fuel:"Petrol",transmission:"Automatic",image:"assets/cars/mercedes-e-class.jpg"},
  {brand:"Audi",name:"Audi A4",category:"Luxury",price:7000,seats:5,fuel:"Petrol",transmission:"Automatic",image:"assets/cars/audi-a4.jpg"},
  {brand:"Audi",name:"Audi Q7",category:"SUV",price:10500,seats:7,fuel:"Diesel",transmission:"Automatic",image:"assets/cars/audi-q7.jpg"},
  {brand:"Porsche",name:"Porsche 911",category:"Sports",price:18000,seats:2,fuel:"Petrol",transmission:"Automatic",image:"assets/cars/porsche-911.jpg"},
  {brand:"Porsche",name:"Porsche Cayenne",category:"SUV",price:14000,seats:5,fuel:"Petrol",transmission:"Automatic",image:"assets/cars/porsche-cayenne.jpg"},
  {brand:"Toyota",name:"Toyota Fortuner",category:"SUV",price:5500,seats:7,fuel:"Diesel",transmission:"Automatic",image:"assets/cars/toyota-fortuner.jpg"},
  {brand:"Toyota",name:"Toyota Innova Crysta",category:"SUV",price:4000,seats:7,fuel:"Diesel",transmission:"Manual",image:"assets/cars/toyota-innova-crysta.jpg"},
  {brand:"Mahindra",name:"Mahindra Thar",category:"SUV",price:4500,seats:4,fuel:"Diesel",transmission:"Manual",image:"assets/cars/mahindra-thar.jpg"},
  {brand:"Mahindra",name:"Mahindra XUV700",category:"SUV",price:4000,seats:7,fuel:"Diesel",transmission:"Automatic",image:"assets/cars/mahindra-xuv700.jpg"},
  {brand:"Hyundai",name:"Hyundai Creta",category:"SUV",price:3000,seats:5,fuel:"Petrol",transmission:"Automatic",image:"assets/cars/hyundai-creta.jpg"},
  {brand:"Hyundai",name:"Hyundai i20",category:"Hatchback",price:1800,seats:5,fuel:"Petrol",transmission:"Manual",image:"assets/cars/hyundai-i20.jpg"},
  {brand:"Maruti Suzuki",name:"Maruti Swift",category:"Hatchback",price:1500,seats:5,fuel:"Petrol",transmission:"Manual",image:"assets/cars/maruti-swift.jpg"},
  {brand:"Maruti Suzuki",name:"Maruti Baleno",category:"Hatchback",price:1700,seats:5,fuel:"Petrol",transmission:"Manual",image:"assets/cars/maruti-baleno.jpg"},
  {brand:"Honda",name:"Honda City",category:"Sedan",price:2500,seats:5,fuel:"Petrol",transmission:"Automatic",image:"assets/cars/honda-city.jpg"},
  {brand:"Tata",name:"Tata Nexon",category:"SUV",price:2200,seats:5,fuel:"Petrol",transmission:"Manual",image:"assets/cars/tata-nexon.jpg"},
  {brand:"Ford",name:"Ford Mustang",category:"Sports",price:16000,seats:4,fuel:"Petrol",transmission:"Automatic",image:"assets/cars/ford-mustang.jpg"}
];

/* ==========================================
   DEMO DATA GENERATION
========================================== */

function generateCars() {
  return Array.from({length:1000}, (_, i) => {
    const model = models[i % models.length];

    return {
      id:"DX" + String(i + 1).padStart(4, "0"),
      brand:model.brand,
      name:model.name,
      category:model.category,
      price:model.price,
      seats:model.seats,
      fuel:model.fuel,
      transmission:model.transmission,
      image:model.image,
      status:i < 100 ? "Rented" : i < 200 ? "Maintenance" : "Available"
    };
  });
}

function generateCustomers() {
  const firstNames = [
    "Aarav","Priya","Rahul","Ananya","Rohan","Ishita","Arjun","Meera",
    "Kabir","Diya","Vivaan","Aditi","Aditya","Sara","Karan","Neha",
    "Dev","Riya","Manav","Tanya"
  ];
  const lastNames = [
    "Sharma","Verma","Mehta","Singh","Patel","Gupta","Kumar","Malhotra",
    "Kapoor","Reddy","Joshi","Chopra","Das","Mishra","Bansal","Arora"
  ];

  return Array.from({length:100}, (_, i) => {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[Math.floor(i / firstNames.length) % lastNames.length];

    return {
      id:"CUS" + String(i + 1001),
      name:first + " " + last,
      email:(first + "." + last + i + "@example.com").toLowerCase(),
      phone:"98" + String(76543000 + i).slice(-8),
      license:"DL-142025-" + String(i + 1).padStart(4, "0")
    };
  });
}

function seedData() {
  const cars = generateCars();
  const customers = generateCustomers();

  const bookings = Array.from({length:100}, (_, i) => ({
    id:"BK" + String(i + 1001),
    customer:customers[i].id,
    car:cars[i].id,
    start:addDays(-1),
    end:addDays(3 + (i % 5)),
    amount:cars[i].price * 4,
    status:"Confirmed"
  }));

  const returns = Array.from({length:100}, (_, i) => ({
    id:"RET" + String(i + 1001),
    booking:"OLD" + String(i + 1001),
    customer:customers[i].id,
    car:cars[200 + i].id,
    date:addDays(-(i + 1)),
    condition:"Good",
    notes:"Vehicle inspected. No issues reported."
  }));

  const services = Array.from({length:100}, (_, i) => ({
    id:"SRV" + String(i + 1001),
    car:cars[100 + i].id,
    issue:[
      "Scheduled oil change",
      "Brake inspection",
      "Tyre replacement",
      "Engine check",
      "General servicing"
    ][i % 5],
    date:addDays(-(i % 20)),
    cost:1500 + (i % 5) * 500,
    status:"In Progress"
  }));

  const payments = Array.from({length:100}, (_, i) => ({
    id:"PAY" + String(i + 1001),
    booking:bookings[i].id,
    customer:customers[i].id,
    amount:1000,
    method:["UPI","Card","Net Banking","Cash"][i % 4],
    date:addDays(-(i % 30)),
    status:"Paid"
  }));

  const analytics = Array.from({length:100}, (_, i) => ({
    id:"AN" + String(i + 1001),
    metric:["Bookings","Revenue","Fleet Utilization","Customer Growth"][i % 4],
    value:[100,1000,10,100][i % 4],
    period:"Day " + (i + 1)
  }));

  return {
    cars,customers,bookings,returns,services,payments,analytics,
    settings:{
      business:"DRIVE X Premium Rentals",
      email:"support@drivex.com",
      phone:"+91 9876543210",
      currency:"INR (₹)",
      rate:2500
    }
  };
}

/* ==========================================
   LOAD AND SAVE
========================================== */

let data;

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  data = saved ? JSON.parse(saved) : seedData();

  if (!data || !Array.isArray(data.cars) || !Array.isArray(data.bookings)) {
    data = seedData();
  }
} catch (error) {
  console.warn("Saved data could not be loaded:", error);
  data = seedData();
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    toast("Unable to save data. Browser storage may be full.", true);
  }
}

function carById(id) {
  return data.cars.find(car => car.id === id);
}

function customerById(id) {
  return data.customers.find(customer => customer.id === id);
}

function bookingById(id) {
  return data.bookings.find(booking => booking.id === id);
}

/* ==========================================
   TOAST MESSAGES
========================================== */

let toastTimer;

function toast(message, error = false) {
  const el = $("toast");
  el.textContent = message;
  el.className = "toast show" + (error ? " error" : "");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}

/* ==========================================
   NAVIGATION
========================================== */

function navigate(page) {
  const target = $(page);
  if (!target) return;

  document.querySelectorAll(".page").forEach(section => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  target.classList.add("active");

  const activeLink = document.querySelector(`[data-page="${page}"] span`);
  $("currentPage").textContent = activeLink?.textContent || page;

  $("sidebar").classList.remove("open");
  renderAll();
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => navigate(link.dataset.page));
});

$("menuBtn").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

$("notificationBtn").addEventListener("click", () => {
  toast("You are all caught up. No new notifications.");
});

/* ==========================================
   CAR MANAGEMENT
========================================== */

let carPage = 1;
const perPage = 15;

function carCard(car) {
  const image = escapeHTML(car.image);
  const name = escapeHTML(car.name);

  return `
    <article class="car-card">
      <div class="car-image">
        <img src="${image}" alt="${name}" loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
        <div class="image-placeholder" style="display:none">
          <strong>🚘</strong>${name}
        </div>
        <span class="car-tag">${escapeHTML(car.category)}</span>
      </div>
      <div class="car-details">
        <h3>${name}</h3>
        <div class="car-meta">
          <span>${escapeHTML(car.id)}</span>
          ${statusHTML(car.status)}
        </div>
        <div class="car-meta" style="margin-top:10px">
          <span>${car.seats} Seats · ${escapeHTML(car.fuel)}</span>
          <span>${escapeHTML(car.transmission)}</span>
        </div>
        <div class="car-price">
          <div><strong>${money(car.price)}</strong><small> / day</small></div>
          <button onclick="editCar('${car.id}')">EDIT VEHICLE</button>
        </div>
      </div>
    </article>`;
}

function renderCars() {
  const search = ($("carSearch").value || "").toLowerCase();
  const brand = $("brandFilter").value;
  const category = $("categoryFilter").value;
  const availability = $("availabilityFilter").value;

  const filtered = data.cars.filter(car => {
    const matchesSearch =
      `${car.id} ${car.name} ${car.brand}`.toLowerCase().includes(search);

    return matchesSearch &&
      (!brand || car.brand === brand) &&
      (!category || car.category === category) &&
      (!availability || car.status === availability);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  carPage = Math.min(Math.max(1, carPage), totalPages);

  const start = (carPage - 1) * perPage;
  const visible = filtered.slice(start, start + perPage);

  $("carCount").textContent =
    `${filtered.length.toLocaleString("en-IN")} vehicles found`;

  $("pageInfo").textContent = `Page ${carPage} of ${totalPages}`;
  $("prevCars").disabled = carPage === 1;
  $("nextCars").disabled = carPage === totalPages;

  $("allCars").innerHTML = visible.map(carCard).join("") ||
    `<div class="empty-state">No vehicles match your search.</div>`;

  $("carTotal").textContent = data.cars.length.toLocaleString("en-IN");
  $("carAvailable").textContent = data.cars.filter(c => c.status === "Available").length;
  $("carRented").textContent = data.cars.filter(c => c.status === "Rented").length;
  $("carMaintenance").textContent = data.cars.filter(c => c.status === "Maintenance").length;

  const selectedBrand = brand;
  $("brandFilter").innerHTML =
    `<option value="">All brands</option>` +
    [...new Set(data.cars.map(car => car.brand))].sort()
      .map(item => `<option value="${escapeHTML(item)}">${escapeHTML(item)}</option>`)
      .join("");

  $("brandFilter").value = selectedBrand;
}

function changePage(direction) {
  carPage += direction;
  renderCars();
}

$("prevCars").addEventListener("click", () => changePage(-1));
$("nextCars").addEventListener("click", () => changePage(1));

function openCarModal(car = null) {
  $("modalTitle").textContent = car ? "Update Vehicle" : "Add Vehicle";

  $("modalForm").innerHTML = `
    <label>Vehicle Brand
      <input name="brand" required maxlength="40" value="${escapeHTML(car?.brand || "")}">
    </label>
    <label>Vehicle Model Name
      <input name="name" required maxlength="60" value="${escapeHTML(car?.name || "")}">
    </label>
    <label>Category
      <select name="category">
        ${["SUV","Sedan","Luxury","Sports","Hatchback"].map(x =>
          `<option ${car?.category === x ? "selected" : ""}>${x}</option>`).join("")}
      </select>
    </label>
    <label>Daily Rental Price (₹)
      <input name="price" type="number" min="1" required value="${car?.price || ""}">
    </label>
    <label>Matching Model Image Path
      <input name="image" required value="${escapeHTML(car?.image || "")}" placeholder="assets/cars/model-name.jpg">
    </label>
    <label>Vehicle Status
      <select name="status">
        ${["Available","Rented","Maintenance"].map(x =>
          `<option ${car?.status === x ? "selected" : ""}>${x}</option>`).join("")}
      </select>
    </label>
    <label>Seats
      <input name="seats" type="number" min="1" max="12" required value="${car?.seats || 5}">
    </label>
    <label>Fuel Type
      <select name="fuel">
        ${["Petrol","Diesel","Electric","Hybrid"].map(x =>
          `<option ${car?.fuel === x ? "selected" : ""}>${x}</option>`).join("")}
      </select>
    </label>
    <label>Transmission
      <select name="transmission">
        ${["Manual","Automatic"].map(x =>
          `<option ${car?.transmission === x ? "selected" : ""}>${x}</option>`).join("")}
      </select>
    </label>
    <div class="form-actions">
      <button type="button" class="outline-btn" onclick="closeModal()">Cancel</button>
      <button class="primary-btn" type="submit">Save Vehicle</button>
    </div>`;

  $("modalForm").onsubmit = event => {
    event.preventDefault();

    const form = new FormData(event.target);
    const item = {
      id:car?.id || makeId("DX"),
      brand:form.get("brand").trim(),
      name:form.get("name").trim(),
      category:form.get("category"),
      price:Number(form.get("price")),
      image:form.get("image").trim(),
      status:form.get("status"),
      seats:Number(form.get("seats")),
      fuel:form.get("fuel"),
      transmission:form.get("transmission")
    };

    if (!item.brand || !item.name || !item.image ||
        !Number.isFinite(item.price) || item.price <= 0 ||
        item.seats < 1 || item.seats > 12) {
      toast("Please enter valid vehicle details.", true);
      return;
    }

    if (car) Object.assign(car, item);
    else data.cars.unshift(item);

    saveData();
    closeModal();
    renderAll();
    toast(car ? "Vehicle updated successfully." : "Vehicle added successfully.");
  };

  openModal();
}

function editCar(id) {
  const car = carById(id);
  if (car) openCarModal(car);
}

/* ==========================================
   CUSTOMER MANAGEMENT
========================================== */

function openCustomerModal(customer = null) {
  $("modalTitle").textContent = customer ? "Update Customer" : "Add Customer";

  $("modalForm").innerHTML = `
    <label>Full Name
      <input name="name" required maxlength="60" value="${escapeHTML(customer?.name || "")}">
    </label>
    <label>Email Address
      <input name="email" type="email" required value="${escapeHTML(customer?.email || "")}">
    </label>
    <label>Phone Number
      <input name="phone" type="tel" pattern="[0-9+() -]{10,16}" required value="${escapeHTML(customer?.phone || "")}">
    </label>
    <label>Driving License Number
      <input name="license" required maxlength="30" value="${escapeHTML(customer?.license || "")}">
    </label>
    <div class="form-actions">
      <button type="button" class="outline-btn" onclick="closeModal()">Cancel</button>
      <button class="primary-btn" type="submit">Save Customer</button>
    </div>`;

  $("modalForm").onsubmit = event => {
    event.preventDefault();
    const form = new FormData(event.target);

    const item = {
      id:customer?.id || makeId("CUS"),
      name:form.get("name").trim(),
      email:form.get("email").trim(),
      phone:form.get("phone").trim(),
      license:form.get("license").trim()
    };

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)) {
      toast("Enter a valid email address.", true);
      return;
    }

    const duplicateEmail = data.customers.some(c =>
      c.email.toLowerCase() === item.email.toLowerCase() && c.id !== item.id
    );

    if (duplicateEmail) {
      toast("This email address is already registered.", true);
      return;
    }

    if (customer) Object.assign(customer, item);
    else data.customers.push(item);

    saveData();
    closeModal();
    renderAll();
    toast("Customer record saved successfully.");
  };

  openModal();
}

function editCustomer(id) {
  const customer = customerById(id);
  if (customer) openCustomerModal(customer);
}

function renderCustomers() {
  const query = ($("customerSearch").value || "").toLowerCase();

  const rows = data.customers.filter(customer =>
    `${customer.id} ${customer.name} ${customer.email} ${customer.phone} ${customer.license}`
      .toLowerCase().includes(query)
  );

  $("customerTotal").textContent = data.customers.length;
  $("customerVerified").textContent = data.customers.length;

  $("customerTable").innerHTML = rows.map(customer => `
    <tr>
      <td>${escapeHTML(customer.id)}</td>
      <td>${escapeHTML(customer.name)}</td>
      <td>${escapeHTML(customer.email)}</td>
      <td>${escapeHTML(customer.phone)}</td>
      <td>${escapeHTML(customer.license)}</td>
      <td>
        <button class="action-btn" onclick="editCustomer('${customer.id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteCustomer('${customer.id}')">Delete</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6">No customers found.</td></tr>`;
}

function deleteCustomer(id) {
  if (data.bookings.some(b => b.customer === id)) {
    toast("Cannot delete a customer linked to a booking.", true);
    return;
  }

  if (!confirm("Delete this customer record?")) return;

  data.customers = data.customers.filter(c => c.id !== id);
  saveData();
  renderAll();
  toast("Customer deleted.");
}

/* ==========================================
   BOOKINGS
========================================== */

function openBookingModal() {
  const available = data.cars.filter(car => car.status === "Available");

  if (!data.customers.length) {
    toast("Add a customer before creating a booking.", true);
    return;
  }

  if (!available.length) {
    toast("No vehicles are currently available.", true);
    return;
  }

  $("modalTitle").textContent = "Create New Booking";

  $("modalForm").innerHTML = `
    <label>Customer
      <select name="customer" required>
        ${data.customers.map(c =>
          `<option value="${c.id}">${escapeHTML(c.name)} (${escapeHTML(c.id)})</option>`).join("")}
      </select>
    </label>
    <label>Available Vehicle
      <select name="car" required>
        ${available.map(c =>
          `<option value="${c.id}">${escapeHTML(c.name)} · ${money(c.price)}/day</option>`).join("")}
      </select>
    </label>
    <label>Pickup Date
      <input name="start" type="date" min="${today}" value="${today}" required>
    </label>
    <label>Return Date
      <input name="end" type="date" min="${addDays(1)}" value="${addDays(2)}" required>
    </label>
    <label>Payment Status
      <select name="payment"><option>Pending</option><option>Paid</option></select>
    </label>
    <div class="form-actions">
      <button type="button" class="outline-btn" onclick="closeModal()">Cancel</button>
      <button class="primary-btn" type="submit">Create Booking</button>
    </div>`;

  openModal();

  $("modalForm").onsubmit = event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const car = carById(form.get("car"));
    const start = form.get("start");
    const end = form.get("end");

    if (!car || car.status !== "Available") {
      toast("Selected vehicle is no longer available.", true);
      return;
    }

    if (start < today || end <= start) {
      toast("Select a valid pickup and return date.", true);
      return;
    }

    const days = Math.ceil((new Date(end) - new Date(start)) / 86400000);

    const booking = {
      id:makeId("BK"),
      customer:form.get("customer"),
      car:car.id,
      start,
      end,
      amount:days * car.price,
      status:"Confirmed"
    };

    data.bookings.push(booking);
    car.status = "Rented";

    if (form.get("payment") === "Paid") {
      data.payments.push({
        id:makeId("PAY"),
        booking:booking.id,
        customer:booking.customer,
        amount:booking.amount,
        method:"Online",
        date:today,
        status:"Paid"
      });
    }

    saveData();
    closeModal();
    renderAll();
    toast("Booking created successfully.");
  };
}

function editBookingStatus(id) {
  const booking = bookingById(id);
  if (!booking) return;

  const nextStatus = prompt(
    "Enter status: Confirmed, Pending or Cancelled",
    booking.status
  );

  if (!nextStatus) return;

  const status = nextStatus.trim();

  if (!["Confirmed","Pending","Cancelled"].includes(status)) {
    toast("Invalid status. Use Confirmed, Pending or Cancelled.", true);
    return;
  }

  const car = carById(booking.car);

  if (status === "Cancelled" && car && car.status === "Rented") {
    car.status = "Available";
  } else if (status === "Confirmed" && car && car.status === "Available") {
    car.status = "Rented";
  } else if (status === "Confirmed" && car && car.status !== "Rented") {
    toast("This vehicle is not available to confirm.", true);
    return;
  }

  booking.status = status;
  saveData();
  renderAll();
  toast("Booking status updated.");
}

function renderBookings() {
  const query = ($("bookingSearch").value || "").toLowerCase();

  $("bookingTotal").textContent = data.bookings.length;
  $("bookingConfirmed").textContent = data.bookings.filter(b => b.status === "Confirmed").length;
  $("bookingPending").textContent = data.bookings.filter(b => b.status === "Pending").length;
  $("bookingCancelled").textContent = data.bookings.filter(b => b.status === "Cancelled").length;

  const rows = data.bookings.filter(b => {
    const customer = customerById(b.customer);
    const car = carById(b.car);
    return `${b.id} ${customer?.name || ""} ${car?.name || ""}`
      .toLowerCase().includes(query);
  });

  $("bookingTable").innerHTML = rows.map(b => {
    const customer = customerById(b.customer);
    const car = carById(b.car);

    return `
      <tr>
        <td>${escapeHTML(b.id)}</td>
        <td>${escapeHTML(customer?.name || "Unknown")}</td>
        <td>${escapeHTML(car?.name || "Unknown")}</td>
        <td>${escapeHTML(b.start)}</td>
        <td>${escapeHTML(b.end)}</td>
        <td>${money(b.amount)}</td>
        <td>${statusHTML(b.status)}</td>
        <td><button class="action-btn" onclick="editBookingStatus('${b.id}')">Update</button></td>
      </tr>`;
  }).join("") || `<tr><td colspan="8">No bookings found.</td></tr>`;
}

/* ==========================================
   ACTIVE RENTALS AND RETURNS
========================================== */

function completeReturn(id) {
  const booking = bookingById(id);

  if (!booking || booking.status !== "Confirmed") {
    toast("This rental is not active.", true);
    return;
  }

  const condition = prompt(
    "Return condition: Good, Damaged or Needs Service",
    "Good"
  );

  if (!condition) return;

  const allowed = ["Good","Damaged","Needs Service"];

  if (!allowed.includes(condition.trim())) {
    toast("Enter Good, Damaged or Needs Service.", true);
    return;
  }

  const finalCondition = condition.trim();
  const car = carById(booking.car);

  booking.status = "Completed";
  booking.returnCondition = finalCondition;

  if (car) {
    car.status = finalCondition === "Good" ? "Available" : "Maintenance";
  }

  data.returns.unshift({
    id:makeId("RET"),
    booking:booking.id,
    customer:booking.customer,
    car:booking.car,
    date:today,
    condition:finalCondition,
    notes:"Return inspection recorded."
  });

  saveData();
  renderAll();
  toast("Vehicle return recorded successfully.");
}

function renderRentals() {
  const query = ($("rentalSearch").value || "").toLowerCase();

  const active = data.bookings.filter(b => b.status === "Confirmed");

  const filtered = active.filter(b => {
    const customer = customerById(b.customer);
    const car = carById(b.car);
    return `${b.id} ${customer?.name || ""} ${car?.name || ""}`
      .toLowerCase().includes(query);
  });

  $("activeRentals").textContent = active.length;
  $("vehiclesOut").textContent = active.length;
  $("dueToday").textContent = active.filter(b => b.end === today).length;
  $("overdueRentals").textContent = active.filter(b => b.end < today).length;

  $("rentalTable").innerHTML = filtered.map(b => {
    const customer = customerById(b.customer);
    const car = carById(b.car);
    const total = Math.max(1, (new Date(b.end) - new Date(b.start)) / 86400000);
    const elapsed = (new Date(today) - new Date(b.start)) / 86400000;
    const progress = Math.max(0, Math.min(100, elapsed / total * 100));

    return `
      <tr>
        <td>${escapeHTML(b.id)}</td>
        <td>${escapeHTML(customer?.name || "Unknown")}</td>
        <td>${escapeHTML(car?.name || "Unknown")}</td>
        <td>${escapeHTML(b.end)}</td>
        <td><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div></td>
        <td><button class="action-btn" onclick="completeReturn('${b.id}')">Return Vehicle</button></td>
      </tr>`;
  }).join("") || `<tr><td colspan="6">No active rentals found.</td></tr>`;
}

function renderReturns() {
  const query = ($("returnSearch").value || "").toLowerCase();

  const rows = data.returns.filter(record => {
    const customer = customerById(record.customer);
    const car = carById(record.car);

    return `${record.id} ${record.booking} ${customer?.name || ""} ${car?.name || ""}`
      .toLowerCase().includes(query);
  });

  $("returnTotal").textContent = data.returns.length;
  $("returnGood").textContent = data.returns.filter(r => r.condition === "Good").length;
  $("returnIssue").textContent = data.returns.filter(r => r.condition !== "Good").length;

  $("returnTable").innerHTML = rows.map(record => `
    <tr>
      <td>${escapeHTML(record.id)}</td>
      <td>${escapeHTML(record.booking)}</td>
      <td>${escapeHTML(customerById(record.customer)?.name || "Unknown")}</td>
      <td>${escapeHTML(carById(record.car)?.name || "Unknown")}</td>
      <td>${escapeHTML(record.date)}</td>
      <td>${statusHTML(record.condition)}</td>
    </tr>
  `).join("") || `<tr><td colspan="6">No return records found.</td></tr>`;
}

/* ==========================================
   MAINTENANCE CENTER
========================================== */

function openMaintenanceModal() {
  $("modalTitle").textContent = "Add Maintenance Record";

  $("modalForm").innerHTML = `
    <label>Vehicle
      <select name="car">
        ${data.cars.map(car =>
          `<option value="${car.id}">${escapeHTML(car.id)} · ${escapeHTML(car.name)}</option>`).join("")}
      </select>
    </label>
    <label>Issue / Service Description
      <input name="issue" required maxlength="100" placeholder="Enter service details">
    </label>
    <label>Service Date
      <input name="date" type="date" value="${today}" required>
    </label>
    <label>Service Cost (₹)
      <input name="cost" type="number" min="0" required value="0">
    </label>
    <label>Service Status
      <select name="status"><option>Scheduled</option><option>In Progress</option><option>Completed</option></select>
    </label>
    <div class="form-actions">
      <button type="button" class="outline-btn" onclick="closeModal()">Cancel</button>
      <button class="primary-btn" type="submit">Save Service</button>
    </div>`;

  openModal();

  $("modalForm").onsubmit = event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const car = carById(form.get("car"));
    const cost = Number(form.get("cost"));

    if (!car || !form.get("issue").trim() || cost < 0 || !Number.isFinite(cost)) {
      toast("Please enter valid maintenance details.", true);
      return;
    }

    const record = {
      id:makeId("SRV"),
      car:car.id,
      issue:form.get("issue").trim(),
      date:form.get("date"),
      cost,
      status:form.get("status")
    };

    data.services.push(record);

    if (record.status !== "Completed") car.status = "Maintenance";

    saveData();
    closeModal();
    renderAll();
    toast("Maintenance record added.");
  };
}

function updateServiceStatus(id) {
  const service = data.services.find(s => s.id === id);
  if (!service) return;

  const nextStatus = prompt(
    "Enter service status: Scheduled, In Progress or Completed",
    service.status
  );

  if (!nextStatus) return;

  if (!["Scheduled","In Progress","Completed"].includes(nextStatus.trim())) {
    toast("Invalid maintenance status.", true);
    return;
  }

  service.status = nextStatus.trim();

  if (service.status === "Completed") {
    const car = carById(service.car);
    if (car && car.status === "Maintenance") car.status = "Available";
  }

  saveData();
  renderAll();
  toast("Maintenance status updated.");
}

function renderMaintenance() {
  const query = ($("maintenanceSearch").value || "").toLowerCase();

  const rows = data.services.filter(service => {
    const car = carById(service.car);
    return `${service.id} ${car?.name || ""} ${service.issue}`
      .toLowerCase().includes(query);
  });

  $("serviceCount").textContent = data.services.length;
  $("maintenanceCount").textContent = data.cars.filter(c => c.status === "Maintenance").length;
  $("serviceCompleted").textContent = data.services.filter(s => s.status === "Completed").length;
  $("serviceCost").textContent = money(data.services.reduce((sum, s) => sum + Number(s.cost || 0), 0));

  $("maintenanceTable").innerHTML = rows.map(service => `
    <tr>
      <td>${escapeHTML(service.id)}</td>
      <td>${escapeHTML(carById(service.car)?.name || "Unknown")}</td>
      <td>${escapeHTML(service.issue)}</td>
      <td>${escapeHTML(service.date)}</td>
      <td>${money(service.cost)}</td>
      <td>${statusHTML(service.status)}</td>
      <td><button class="action-btn" onclick="updateServiceStatus('${service.id}')">Update</button></td>
    </tr>
  `).join("") || `<tr><td colspan="7">No maintenance records found.</td></tr>`;
}

/* ==========================================
   PAYMENTS
========================================== */

function renderPayments() {
  const query = ($("paymentSearch").value || "").toLowerCase();

  const paid = data.payments.filter(p => p.status === "Paid");
  const revenue = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pending = data.payments
    .filter(p => p.status === "Pending")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  $("paymentRevenue").textContent = money(revenue);
  $("paymentCount").textContent = data.payments.length;
  $("averagePayment").textContent = money(data.payments.length ? revenue / data.payments.length : 0);
  $("pendingAmount").textContent = money(pending);

  const rows = data.payments.filter(p => {
    const customer = customerById(p.customer);
    return `${p.id} ${p.booking} ${customer?.name || ""}`
      .toLowerCase().includes(query);
  });

  $("paymentTable").innerHTML = rows.map(payment => `
    <tr>
      <td>${escapeHTML(payment.id)}</td>
      <td>${escapeHTML(payment.booking)}</td>
      <td>${escapeHTML(customerById(payment.customer)?.name || "Unknown")}</td>
      <td>${money(payment.amount)}</td>
      <td>${escapeHTML(payment.method)}</td>
      <td>${escapeHTML(payment.date || "")}</td>
      <td>${statusHTML(payment.status)}</td>
    </tr>
  `).join("") || `<tr><td colspan="7">No payment records found.</td></tr>`;
}

/* ==========================================
   ANALYTICS
========================================== */

function renderAnalytics() {
  const totalCars = data.cars.length;
  const rentedCars = data.cars.filter(c => c.status === "Rented").length;
  const revenue = data.payments
    .filter(p => p.status === "Paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  $("analyticsRecords").textContent = data.analytics.length;
  $("utilization").textContent =
    totalCars ? Math.round(rentedCars / totalCars * 100) + "%" : "0%";
  $("analyticsCustomers").textContent = data.customers.length;
  $("analyticsRevenue").textContent = money(revenue);

  const statuses = ["Confirmed","Pending","Completed","Cancelled"];
  const counts = statuses.map(status => ({
    name:status,
    value:data.bookings.filter(b => b.status === status).length
  }));

  const max = Math.max(1, ...counts.map(item => item.value));

  $("bookingChart").innerHTML = counts.map(item => `
    <div class="chart-bar" title="${item.name}: ${item.value}"
      style="height:${Math.max(5, item.value / max * 100)}%">
      <span>${item.name}</span>
    </div>
  `).join("");

  const categories = [...new Set(data.cars.map(car => car.category))];

  $("categorySummary").innerHTML = categories.map(category => {
    const count = data.cars.filter(car => car.category === category).length;

    return `
      <div class="category-row">
        <span>${escapeHTML(category)}</span>
        <strong>${count.toLocaleString("en-IN")}</strong>
      </div>`;
  }).join("");

  $("analyticsTable").innerHTML = data.analytics.slice(-10).reverse().map(record => `
    <tr>
      <td>${escapeHTML(record.id)}</td>
      <td>${escapeHTML(record.metric)}</td>
      <td>${escapeHTML(record.value)}</td>
      <td>${escapeHTML(record.period)}</td>
    </tr>
  `).join("");
}

/* ==========================================
   HOME DASHBOARD
========================================== */

function renderDashboard() {
  $("statCars").textContent = data.cars.length.toLocaleString("en-IN");
  $("heroCars").textContent = data.cars.length.toLocaleString("en-IN");
  $("statBookings").textContent =
    data.bookings.filter(b => ["Confirmed","Pending"].includes(b.status)).length;
  $("statCustomers").textContent = data.customers.length;

  const revenue = data.payments
    .filter(p => p.status === "Paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  $("statRevenue").textContent = money(revenue);

  $("todayDate").textContent = new Date().toLocaleDateString("en-IN", {
    weekday:"short",day:"numeric",month:"short",year:"numeric"
  });

  $("featuredCars").innerHTML = data.cars.slice(200, 203).map(carCard).join("");

  $("recentBookings").innerHTML = data.bookings.slice(-5).reverse().map(booking => `
    <tr>
      <td>${escapeHTML(booking.id)}</td>
      <td>${escapeHTML(customerById(booking.customer)?.name || "Unknown")}</td>
      <td>${escapeHTML(carById(booking.car)?.name || "Unknown")}</td>
      <td>${escapeHTML(booking.start)}</td>
      <td>${money(booking.amount)}</td>
      <td>${statusHTML(booking.status)}</td>
    </tr>
  `).join("") || `<tr><td colspan="6">No bookings yet.</td></tr>`;
}

/* ==========================================
   SETTINGS
========================================== */

$("settingsForm").addEventListener("submit", event => {
  event.preventDefault();

  const form = new FormData(event.target);
  const rate = Number(form.get("rate"));

  if (!Number.isFinite(rate) || rate <= 0) {
    toast("Enter a valid default rental rate.", true);
    return;
  }

  data.settings = {
    business:form.get("business").trim(),
    email:form.get("email").trim(),
    phone:form.get("phone").trim(),
    currency:form.get("currency"),
    rate
  };

  saveData();
  toast("Business settings saved successfully.");
});

/* ==========================================
   EXPORT AND RESET
========================================== */

function exportData() {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {type:"application/json"}
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "drive-x-management-data.json";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
  toast("Your data export has started.");
}

function resetData() {
  if (!confirm("Reset all records to the original DRIVE X demo dataset?")) return;

  data = seedData();
  saveData();
  renderAll();
  toast("Demo data has been restored.");
}

/* ==========================================
   MODAL HELPERS
========================================== */

function openModal() {
  $("modal").classList.add("show");
}

function closeModal() {
  $("modal").classList.remove("show");
  $("modalForm").onsubmit = null;
}

$("closeModal").addEventListener("click", closeModal);

$("modal").addEventListener("click", event => {
  if (event.target === $("modal")) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

/* ==========================================
   SEARCH AND FILTER EVENTS
========================================== */

["carSearch","categoryFilter","availabilityFilter","brandFilter"].forEach(id => {
  $(id).addEventListener("input", () => {
    carPage = 1;
    renderCars();
  });
});

$("bookingSearch").addEventListener("input", renderBookings);
$("customerSearch").addEventListener("input", renderCustomers);
$("rentalSearch").addEventListener("input", renderRentals);
$("returnSearch").addEventListener("input", renderReturns);
$("maintenanceSearch").addEventListener("input", renderMaintenance);
$("paymentSearch").addEventListener("input", renderPayments);

/* ==========================================
   RENDER EVERYTHING
========================================== */

function renderAll() {
  renderDashboard();
  renderCars();
  renderBookings();
  renderCustomers();
  renderRentals();
  renderReturns();
  renderMaintenance();
  renderPayments();
  renderAnalytics();
}

/* ==========================================
   INITIAL STARTUP
========================================== */

renderAll();
saveData();



































