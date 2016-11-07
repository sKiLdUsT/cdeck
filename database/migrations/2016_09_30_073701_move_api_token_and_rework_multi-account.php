<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MoveApiTokenAndReworkMultiAccount extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->char('api_token', 16);
            $table->dropColumn('accounts');
            $table->text('token');
            $table->text('media');
            $table->text('authorized');
        });
        DB::table('users')->truncate();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('api_token');
            $table->dropColumn('token');
            $table->dropColumn('media');
            $table->dropColumn('authorized');
            $table->longText('accounts');
        });
        DB::table('users')->truncate();
    }
}
