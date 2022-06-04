// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

import Hello from "./hello_react";
import Books from "./Books"
import mount from './mount'

mount({ Hello, Books });
