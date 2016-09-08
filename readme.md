# cDeck Twitter Board


## How to use

Production/Beta deployment:

* make sure Composer is installed
* git clone branch to desired docroot, p.e. /var/www/cdeck
* run `composer install`
* copy `.env.default` to `.env` and modify config respectively
* add an MySQL user for the site with permissions SELECT, ALTER, DELETE, INSERT and UPDATE and run `php artisan migrate`
* compile assets with `gulp` (`--production` for minified version)
* finalize with `php artisan optimize && php artisan key:generate`

Developing deployment:
* go to the [Vagrant Development Kit Git](https://git.skildust.com/cDeck/cdeck) (Make sure `vagrant` is installed and usable)
* clone into new directory and do `git submodules init && git submodules update`
* now do `vagrant up`. The box will configure itself. Afterwards, you can reach the site at [localhost](http://localhost)
