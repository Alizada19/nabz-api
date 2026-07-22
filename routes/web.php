<?php

use Illuminate\Support\Facades\Route;

// Catch-all route to serve the React SPA
Route::get('/{any?}', function () {
    return view('welcome'); // Make sure 'welcome' matches your blade filename
})->where('any', '.*');