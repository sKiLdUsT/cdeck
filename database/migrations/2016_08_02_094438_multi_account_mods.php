<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MultiAccountMods extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar');
            $table->dropColumn('token');
            $table->dropColumn('banner');
            $table->mediumText('accounts');
        });
        DB::table('users')->truncate();
        DB::table('sessions')->truncate();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar');
            $table->string('token');
            $table->string('banner');
            $table->dropColumn('accounts');
        });
        DB::table('users')->truncate();
        DB::table('sessions')->truncate();
    }
}
