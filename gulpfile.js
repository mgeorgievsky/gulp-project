const { src, dest, parallel, series, watch } = require('gulp');

const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');

// Создаем функцию для browser-sync
function browsersync() {
    browserSync.init({  // Инициализируем browser-sync и задаем параметры
        server: { baseDir: 'app' }, // Отслеживаем папку app
        notify: false,   // Отключаем уведомления
        online: true    // Изменить на false, если нет подключения к сети
    })
}

// Создаем функцию для обработки скриптов
function scripts() {
    return src([    // Выбираем файлы
        'node_modules/jquery/dist/jquery.min.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))    // Собираем все файлы в один файл main.min.js
    .pipe(uglify())     // Сжимаем файл main.min.js
    .pipe(dest('app/js/'))  // Сохраняем файл main.min.js в папку app/js
    .pipe(browserSync.stream()) // Обновляем страницу с помощью browsersync
}

// Функция для обработки стилей
function styles() {
    return src('app/sass/main.sass')    // Выбираем файл main.sass Остальные стили можно импортировать в него.
    .pipe(sass())   // Компилируем файл main.sass
    .pipe(concat('main.min.css'))   // Конкатенируем всё в файл main.min.css
    .pipe(autoprefixer({    // Обрабатываем файл автопрефиксером
        overrideBrowserslist: ['last 10 versions'],    // Указываем браузеры с которыми будем работать
        grid: true  // Включаем префиксы для поддержки grid
    }))
    .pipe(cleancss({    // Выполняем обработку плагином gulp-clean-css
        level: { 1: { specialComments: 0 } },   // минифицируем css файл
        // format: 'beautify'  // Красиво форматируем css файл
    }))
    .pipe(dest('app/css/'))     // Выгружаем main.min.css в папку app/css/
}

// Создаем функцию для отслеживания изменений
function startwatch() {
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts) // выполняем scripts при каждом изменении выбранных файлов
}

//Экспорт функций
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.default = parallel(scripts, browsersync, startwatch);


// Продолжить тут https://www.youtube.com/watch?v=n-N1BnloIVE&t=3500s