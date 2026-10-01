// Состояние мультипликатора типа кузова, выбранной услуги и списка услуг калькулятора
let currentCarMultiplier = 1.0;
let selectedCarType = "Не выбран"; // Переменная для хранения типа кузова
let selectedServiceName = "Консультация";
let selectedServicesList = []; // Массив для хранения выбранных в калькуляторе услуг

document.addEventListener("DOMContentLoaded", () => {
  // --- Переключение мобильного меню ---
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    document.querySelectorAll(".mobile-link").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  // --- Слайдер До / После ---
  const baContainer = document.getElementById("baSlider");
  const baClippedImage = document.getElementById("baClippedImage");
  const baBeforeImg = document.getElementById("baBeforeImg");
  const baHandle = document.getElementById("baHandle");
  let isSliding = false;

  function updateSliderWidth() {
    if (baContainer && baBeforeImg) {
      // Приравниваем ширину внутреннего фото "ДО" к полной ширине контейнера
      baBeforeImg.style.width = baContainer.offsetWidth + "px";
    }
  }

  window.addEventListener("resize", updateSliderWidth);
  // Вызываем функцию сразу при загрузке
  updateSliderWidth();

  function moveSlider(x) {
    if (!baContainer || !baClippedImage || !baHandle) return;
    const rect = baContainer.getBoundingClientRect();
    let position = x - rect.left;
    if (position < 0) position = 0;
    if (position > rect.width) position = rect.width;

    const percentage = (position / rect.width) * 100;
    baClippedImage.style.width = percentage + "%";
    baHandle.style.left = percentage + "%";
  }

  if (baContainer) {
    baContainer.addEventListener("mousedown", (e) => {
      isSliding = true;
      moveSlider(e.clientX); // Позволяет кликать в любую точку слайдера
    });
    
    window.addEventListener("mouseup", () => (isSliding = false));
    window.addEventListener("mousemove", (e) => {
      if (!isSliding) return;
      moveSlider(e.clientX);
    });

    // События касания для мобильных устройств
    baContainer.addEventListener("touchstart", (e) => {
      isSliding = true;
      moveSlider(e.touches[0].clientX);
    });
    
    window.addEventListener("touchend", () => (isSliding = false));
    window.addEventListener("touchmove", (e) => {
      if (!isSliding) return;
      moveSlider(e.touches[0].clientX);
    });
  }

  // --- Настройка маски телефона ---
  const phoneInput = document.getElementById("userPhoneInput");
  if (phoneInput) {
    phoneInput.addEventListener("input", handlePhoneInput);
    phoneInput.addEventListener("keydown", handlePhoneKeyDown);
  }

  // --- Ограничение ввода имени (только буквы, пробелы, дефис) ---
  const nameInput = document.getElementById("userNameInput");
  if (nameInput) {
    nameInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^a-zA-Aа-яА-ЯёЁ\s-]/g, "");
      const error = document.getElementById("nameError");
      if (error) error.classList.add("hidden");
    });
  }
});

// --- Маска телефона (+7 (XXX) XXX-XX-XX) ---
function handlePhoneInput(e) {
  let input = e.target;
  let inputNumbersValue = input.value.replace(/\D/g, "");
  let selectionStart = input.selectionStart;
  let formattedInputValue = "";

  if (!inputNumbersValue) {
    input.value = "";
    return;
  }

  if (input.value.length !== selectionStart) {
    if (e.data && /\D/g.test(e.data)) {
      input.value = formattedInputValue;
    }
    return;
  }

  if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
    if (inputNumbersValue[0] === "9") {
      inputNumbersValue = "7" + inputNumbersValue;
    }

    inputNumbersValue = inputNumbersValue.substring(0, 11);
    formattedInputValue = "+7";

    if (inputNumbersValue.length > 1) {
      formattedInputValue += " (" + inputNumbersValue.substring(1, 4);
    }
    if (inputNumbersValue.length >= 5) {
      formattedInputValue += ") " + inputNumbersValue.substring(4, 7);
    }
    if (inputNumbersValue.length >= 8) {
      formattedInputValue += "-" + inputNumbersValue.substring(7, 9);
    }
    if (inputNumbersValue.length >= 10) {
      formattedInputValue += "-" + inputNumbersValue.substring(9, 11);
    }
  } else {
    inputNumbersValue = "7" + inputNumbersValue.substring(0, 10);
    formattedInputValue = "+7 (" + inputNumbersValue.substring(1, 4);
  }

  input.value = formattedInputValue;

  const phoneError = document.getElementById("phoneError");
  if (phoneError) phoneError.classList.add("hidden");
}

function handlePhoneKeyDown(e) {
  let inputValue = e.target.value.replace(/\D/g, "");
  if (e.keyCode === 8 && inputValue.length <= 1) {
    e.target.value = "";
  }
}

// --- Калькулятор: выбор типа авто ---
function selectCarType(element, type, multiplier) {
  document.querySelectorAll(".car-type-card").forEach((card) => {
    card.classList.remove("border-tiptop-gold", "bg-tiptop-gold/10");
    card.classList.add("border-transparent", "bg-tiptop-cardBg");
    const icon = card.querySelector("i");
    if (icon) {
      icon.classList.remove("text-tiptop-gold");
      icon.classList.add("text-gray-400");
    }
  });

  element.classList.remove("border-transparent", "bg-tiptop-cardBg");
  element.classList.add("border-tiptop-gold", "bg-tiptop-gold/10");
  const icon = element.querySelector("i");
  if (icon) {
    icon.classList.remove("text-gray-400");
    icon.classList.add("text-tiptop-gold");
  }

  // Получаем название выбранного кузова из текста внутри карточки или используем переданный параметр type
  const textElement = element.querySelector(".font-bold, h3, p, span");
  selectedCarType = textElement ? textElement.innerText.split("\n")[0].trim() : type;

  currentCarMultiplier = multiplier;
  calculateTotal();
}

// --- Калькулятор: пересчет итоговой стоимости ---
function calculateTotal() {
  const checkboxes = document.querySelectorAll(".service-checkbox:checked");
  let baseSum = 0;
  checkboxes.forEach((cb) => {
    baseSum += parseFloat(cb.value);
  });

  const total = Math.round(baseSum * currentCarMultiplier);
  const display = document.getElementById("totalPriceDisplay");
  if (display) {
    display.innerText = total.toLocaleString("ru-RU") + " ₽";
  }
}

// --- Передача сметы калькулятора в модальное окно ---
function submitCalculatorEstimate() {
  const checkboxes = document.querySelectorAll(".service-checkbox:checked");
  selectedServicesList = [];

  if (checkboxes.length === 0) {
    openBookingModal("Онлайн-расчет калькулятора");
    return;
  }

  checkboxes.forEach((cb) => {
    const name = cb.getAttribute("data-name") || cb.parentElement.innerText.trim();
    selectedServicesList.push(name);
  });

  const priceDisplay = document.getElementById("totalPriceDisplay");
  const price = priceDisplay ? priceDisplay.innerText : "0 ₽";
  openBookingModal(`Расчёт сметы: ${price}`);
}

// --- Фильтр портфолио ---
function filterPortfolio(category) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("bg-tiptop-gold", "text-black");
    btn.classList.add("bg-gray-800", "text-white");
  });
  if (window.event && window.event.target) {
    window.event.target.classList.remove("bg-gray-800", "text-white");
    window.event.target.classList.add("bg-tiptop-gold", "text-black");
  }

  const items = document.querySelectorAll(".portfolio-item");
  items.forEach((item) => {
    if (category === "all" || item.classList.contains(category)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

// --- Вопросы и ответы (FAQ Accordion) ---
function toggleFaq(button) {
  const content = button.nextElementSibling;
  const icon = button.querySelector("i");

  document.querySelectorAll(".faq-content").forEach((item) => {
    if (item !== content) {
      item.classList.add("hidden");
      const otherIcon = item.previousElementSibling.querySelector("i");
      if (otherIcon) otherIcon.style.transform = "rotate(0deg)";
    }
  });

  content.classList.toggle("hidden");
  if (!content.classList.contains("hidden")) {
    if (icon) icon.style.transform = "rotate(180deg)";
  } else {
    if (icon) icon.style.transform = "rotate(0deg)";
  }
}

// --- Управление модальным окном записи ---
function openBookingModal(serviceName) {
  selectedServiceName = serviceName || "Консультация";

  // Если открыли форму не из калькулятора, очищаем список отмеченных услуг
  if (!serviceName.includes("Расчёт сметы")) {
    selectedServicesList = [];
  }

  const tag = document.getElementById("modalServiceTag");
  if (tag) {
    tag.innerText = `Выбранная услуга: ${selectedServiceName}`;
  }
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeBookingModal() {
  const modal = document.getElementById("bookingModal");
  if (modal) {
    modal.classList.add("hidden");
  }

  // Очистка сообщений об ошибках
  const nameError = document.getElementById("nameError");
  const phoneError = document.getElementById("phoneError");
  if (nameError) nameError.classList.add("hidden");
  if (phoneError) phoneError.classList.add("hidden");
}

// --- Отправка формы с подробным списком услуг в Telegram ---
async function handleBookingSubmit(event) {
  // Защита от ошибок event на мобильных устройствах
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  const nameInput = document.getElementById("userNameInput");
  const phoneInput = document.getElementById("userPhoneInput");
  const carInput = document.getElementById("userCarInput");
  const nameError = document.getElementById("nameError");
  const phoneError = document.getElementById("phoneError");
  const submitBtn = document.getElementById("submitBookingBtn");

  let isValid = true;

  // Валидация имени (не менее 2 символов)
  const nameValue = nameInput ? nameInput.value.trim() : "";
  if (nameValue.length < 2) {
    if (nameError) nameError.classList.remove("hidden");
    isValid = false;
  } else {
    if (nameError) nameError.classList.add("hidden");
  }

  // Валидация телефона (адаптировано для автозаполнения на мобайле)
  let digitsOnly = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";
  if (digitsOnly.length === 10) {
    digitsOnly = "7" + digitsOnly;
  }

  if (digitsOnly.length < 11) {
    if (phoneError) phoneError.classList.remove("hidden");
    isValid = false;
  } else {
    if (phoneError) phoneError.classList.add("hidden");
  }

  if (!isValid) return;

  // Настройки Telegram API
  const BOT_TOKEN = "8842734031:AAGdjjtfA3elq4f2NHmojkjSoRwAUAly15I";
  const CHAT_ID = "5213680806";

  // Формируем красивый список услуг
  let servicesDetails = "";
  if (typeof selectedServicesList !== "undefined" && selectedServicesList.length > 0) {
    servicesDetails = "\n📋 <b>Выбранные услуги в калькуляторе:</b>\n" + 
      selectedServicesList.map((service) => `  • ${service}`).join("\n");
  }

  const carType = typeof selectedCarType !== "undefined" ? selectedCarType : "Не выбран";
  const serviceName = typeof selectedServiceName !== "undefined" ? selectedServiceName : "Консультация";

  const message = `
🔥 <b>Новая заявка ArmorTech!</b>

👤 <b>Имя:</b> ${nameValue}
📞 <b>Телефон:</b> ${phoneInput.value.trim()}
🚘 <b>Марка/Модель:</b> ${carInput && carInput.value.trim() ? carInput.value.trim() : "Не указана"}
🚙 <b>Тип кузова:</b> ${carType}
🛠 <b>Запрос/Смета:</b> ${serviceName}${servicesDetails}
📅 <b>Дата:</b> ${new Date().toLocaleString("ru-RU")}
  `;

  // Состояние загрузки кнопки
  const originalText = submitBtn ? submitBtn.innerHTML : "";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Отправка...</span>`;
  }

  try {
    const payload = JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "HTML"
    });

    let response = null;

    // 1. Попытка прямой отправки
    try {
      response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload
      });
    } catch (e) {
      console.warn("Прямой запрос заблокирован сетью/браузером, пробуем резервный канал...");
    }

    // 2. Если прямой запрос заблокирован на смартфоне, отправляем через резервный CORS-прокси
    if (!response || !response.ok) {
      const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`);
      response = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload
      });
    }

    if (response && response.ok) {
      closeBookingModal();

      // Показ уведомления об успехе
      const toast = document.getElementById("successToast");
      if (toast) {
        toast.classList.remove("hidden");
        setTimeout(() => {
          toast.classList.add("hidden");
        }, 4000);
      }

      if (event && event.target && typeof event.target.reset === "function") {
        event.target.reset();
      }
      if (typeof selectedServicesList !== "undefined") {
        selectedServicesList = []; // Очищаем список после успешной отправки
      }
    } else {
      alert("Не удалось отправить заявку. Попробуйте еще раз или свяжитесь с нами по телефону.");
    }
  } catch (error) {
    console.error("Ошибка при отправке в Telegram:", error);
    alert("Произошла ошибка при отправке. Пожалуйста, свяжитесь с нами по телефону.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }
}
