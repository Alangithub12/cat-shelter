document.addEventListener('DOMContentLoaded', () => {
    const catNameInput = document.getElementById('cat-name');
    const catAgeInput = document.getElementById('cat-age');
    const catBreedInput = document.getElementById('cat-breed');
    const catPhotoInput = document.getElementById('cat-photo'); // Новое поле для фото
    const addCatButton = document.getElementById('add-cat');
    const catList = document.getElementById('cat-list');
    const filterCats = document.getElementById('filter-cats');
    const themeToggle = document.getElementById('theme-toggle');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');

    let cats = [];
    loadCats();

    // Закрытие модального окна
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none'; // Убираем модальное окно
    });

    // Переключение темы
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDarkTheme = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
        themeToggle.textContent = isDarkTheme ? 'Светлая тема 🌝' : 'Тёмная тема 🌚';
    });

    // Применение сохраненной темы из localStorage
    applySavedTheme();

    // Добавление кошки
    addCatButton.addEventListener('click', () => {
        const name = catNameInput.value.trim();
        const age = catAgeInput.value.trim();
        const breed = catBreedInput.value.trim();
        const photo = catPhotoInput.files[0]; // Получаем файл фото

        if (name && age && breed) {
            addCat(name, age, breed, photo);
            catNameInput.value = '';
            catAgeInput.value = '';
            catBreedInput.value = '';
            catPhotoInput.value = ''; // Очищаем поле для фото
        } else {
            showToast('Заполните все поля!');
        }
    });

    // Рендеринг списка кошек
    function renderCats(catsToRender = cats) {
        catList.innerHTML = '';
        catsToRender.forEach(cat => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <strong>${cat.name}</strong> (${cat.age} лет, ${cat.breed})
                    <span class="${cat.status === 'available' ? 'available' : 'adopted'}">${cat.status}</span>
                </div>
                <div>
                    <button class="view-cat" data-id="${cat.id}">Посмотреть</button>
                    <button class="adopt-cat" data-id="${cat.id}">${cat.status === 'available' ? 'Усыновить' : 'Отменить усыновление'}</button>
                    <button class="delete-cat" data-id="${cat.id}">Удалить</button> <!-- Новая кнопка для удаления -->
                </div>
            `;
            if (cat.photo) { // Если есть фото, добавляем его в список
                const img = document.createElement('img');
                img.src = cat.photo;
                img.style.maxWidth = '50px';
                li.prepend(img); // Добавляем фото перед текстом
            }
            catList.appendChild(li);
        });

        // Добавление обработчиков событий для кнопок
        document.querySelectorAll('.view-cat').forEach(button => {
            button.addEventListener('click', () => showModal(button.dataset.id));
        });
        document.querySelectorAll('.adopt-cat').forEach(button => {
            button.addEventListener('click', () => toggleAdoption(button.dataset.id));
        });
        document.querySelectorAll('.delete-cat').forEach(button => { // Обработчик для удаления
            button.addEventListener('click', () => deleteCat(button.dataset.id));
        });
    }

    // Добавление кошки
    function addCat(name, age, breed, photo) {
        const newCat = {
            id: Date.now(),
            name,
            age,
            breed,
            status: 'available',
            photo: photo ? URL.createObjectURL(photo) : '' // Преобразуем файл в URL
        };
        cats.push(newCat);
        saveCats();
        renderCats();
        showToast('Кошка добавлена');
    }

    // Удаление кошки
    function deleteCat(id) {
        cats = cats.filter(cat => cat.id != id);
        saveCats();
        renderCats();
        showToast('Кошка удалена');
    }

    // Переключение статуса усыновления
    function toggleAdoption(id) {
        const cat = cats.find(cat => cat.id == id);

        if (cat.status === 'available') {
            cat.status = 'adopted';
        } else {
            cat.status = 'available';
        }

        saveCats();
        renderCats();
        showToast(`Статус кошки "${cat.name}" изменён`);
    }

    // Отображение модального окна
    function showModal(id) {
        const cat = cats.find(cat => cat.id == id);
        document.getElementById('modal-cat-photo').src = cat.photo || ''; // Отображаем фото
        document.getElementById('modal-cat-name').textContent = cat.name;
        document.getElementById('modal-cat-age').textContent = cat.age;
        document.getElementById('modal-cat-breed').textContent = cat.breed;
        document.getElementById('modal-cat-status').textContent = cat.status;
        modal.style.display = 'flex'; // Показываем модальное окно
    }

    // Фильтр кошек
    filterCats.addEventListener('change', () => {
        const selectedFilter = filterCats.value;
        filterCatsList(selectedFilter); // Вызываем функцию фильтрации
    });

    function filterCatsList(filter) {
        let filteredCats = [];

        switch (filter) {
            case 'available':
                filteredCats = cats.filter(cat => cat.status === 'available');
                break;
            case 'adopted':
                filteredCats = cats.filter(cat => cat.status === 'adopted');
                break;
            default:
                filteredCats = cats; // Все кошки
        }

        renderCats(filteredCats); // Перерисовываем список
    }

    // Сохранение данных в localStorage
    function saveCats() {
        localStorage.setItem('cats', JSON.stringify(cats.map(cat => ({
            ...cat,
            photo: '' // Не сохраняем фото, так как это Blob URL
        }))));
    }

    // Загрузка данных из localStorage
    function loadCats() {
        const savedCats = localStorage.getItem('cats');
        if (savedCats) {
            cats = JSON.parse(savedCats).map(cat => ({ ...cat, photo: '' })); // Восстанавливаем пустые фото
            renderCats();
        }
    }

    // Применение сохраненной темы
    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.textContent = 'Светлая тема 🌝';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggle.textContent = 'Тёмная тема 🌚';
        }
    }

    // Уведомления
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '10px 20px';
        toast.style.backgroundColor = '#989393';
        toast.style.color = '#fff';
        toast.style.borderRadius = '5px';
        toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        toast.style.zIndex = '1000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease-in-out';

        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});