# Kontrollraum Twitter Board


## How to use

Production/Beta deployment:

* make sure Composer is installed
* git clone branch to desired docroot, p.e. /var/www/rainboom (Branch `beta` when developing)
* run `composer install`
* copy `.env.default`to `.env` and modify config respectively
* add an MySQL user for the site with permissions SELECT, ALTER, DELETE, INSERT and UPDATE and run `php artisan migrate`

Developing deployment:
* get the [Vagrant Development Kit](http://developer.skildust.com/kit/kontrollraum.zip) (Make sure `vagrant` is installed and usable)
* put it in a new directory  and create a `www` directory inside. Unzip the files
* now `git clone` into the `www`-directory
* now do `vagrant up`. The box will configure itself. Afterwards, you can reach the site at [localhost](http://localhost)