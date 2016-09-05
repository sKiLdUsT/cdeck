<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddColumnsToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('uconfig');
            $table->text('analytics');
        });
        DB::table('users')->update([
            'uconfig' => json_encode([
                'notifications' => false,
                'colormode' => 0,
                'access_level' => 0
            ])
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('uconfig');
            $table->dropColumn('analytics');
        });
    }
}
