<?php
/**
 * Plugin Name: My Horizontal Slider Plugin
 * Description: A horizontal slider (text → video) that triggers a 5-second delay for text before switching to video.
 * Version: 1.0
 * Author: Your Name
 */

function my_horizontal_slider_enqueue() {
  // Enqueue CSS
  wp_enqueue_style(
    'my-horizontal-slider-style',
    plugin_dir_url(__FILE__) . 'assets/style.css',
    array(),
    '1.0'
  );

  // Enqueue JS
  wp_enqueue_script(
    'my-horizontal-slider-script',
    plugin_dir_url(__FILE__) . 'assets/script.js',
    array(),
    '1.0',
    true
  );
}
add_action('wp_enqueue_scripts', 'my_horizontal_slider_enqueue');

function my_horizontal_slider_shortcode() {
  ob_start(); ?>
  
  <div class="slider-container">
    <!-- Slide 1: Text -->
    <div class="slide slide-1">
      <h1>An Aaron Einstein Project</h1>
    </div>
    <!-- Slide 2: Video (no controls) -->
    <div class="slide slide-2">
      <video 
        autoplay 
        muted 
        loop 
        playsinline 
        style="pointer-events: none; width: 400px; height: 250px;"
      >
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
        Your browser does not support HTML video.
      </video>
    </div>
    <!-- Arrows -->
    <div class="arrow arrow-left" onclick="previousSlide()">&#10094;</div>
    <div class="arrow arrow-right" onclick="nextSlide()">&#10095;</div>
  </div>

  <?php
  return ob_get_clean();
}
add_shortcode('my_horizontal_slider', 'my_horizontal_slider_shortcode');
