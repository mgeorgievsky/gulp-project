const { src, dest, parallel, series, watch } = require('gulp');

const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');

let preprocessor = 'sass';

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
    return src('app/' + preprocessor +'/main.' + preprocessor)    // В зависимости от препроцессора выбираем нужный файл стилей.
    .pipe(eval(preprocessor)())   // eval(preprocessor) берет значение переменной и использует его как название функции. Таким образом используется нужный препроцессор (тот что находится в значении переменной preprocessor)
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
    .pipe(browserSync.stream()) // Обновляем страницу
}

// Функция для обработки изображений
function images() {
    return src('app/img/src/**/*')  // Выбираем исходные изображения
    .pipe(newer('app/img/dest/'))   // Сравниваем выбранные изображения с уже обработанными. Выбраны будут только новые изображения.
    .pipe(imagemin())               // Минифицируем изображения
    .pipe(dest('app/img/dest/'))    // Помещаем минифицированные изображения в конечную папку
}

// Функция для очистки изображений
function cleanimages() {
    return del('app/img/dest/**/*', { force: true })
}

// Функция для очистки папки dist
function cleandist() {
    return del('dist/**/*', { force: true })
}

function buildcopy() {
    return src([    // выбираем нужные файлы для копирования в dist
        'app/css/**/*.min.css',
        'app/js/**/*min.js',
        'app/img/dest/**/*',
        'app/**/*.html'
    ], { base: 'app' }) // Копируем структуру папок из папки app в папку dist
    .pipe(dest('dist')) // Возвращаем всё в папку dist
}

// Создаем функцию для отслеживания изменений
function startwatch() {
    watch(['app/**/' + preprocessor + '**/*.' + preprocessor], styles) // выполняем styles при каждом изменении выбранных файлов
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts) // выполняем scripts при каждом изменении выбранных файлов
    watch('app/**/*.html').on('change', browserSync.reload) // При изменении html файлов перезагружаем страницу.
    watch('app/img/src/**/*', images)   // Отслеживаем изменения в папке с изображениями
}

//Экспорт функций
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleanimages = cleanimages;
exports.build = series(cleandist, styles, scripts, images, buildcopy);

exports.default = parallel(images, styles, scripts, browsersync, startwatch);

