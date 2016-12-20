<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('handle')->unique();
            $table->string('twitter_id');
            $table->longText('uconfig');
            $table->text('analytics')->nullable();
            $table->string('api_token')->nullable();
            $table->integer('authorized')->default(0);
            $table->text('token');
            $table->text('media');
            $table->rememberToken();
            $table->timestamps();
        });
        Schema::create('sessions', function ($table) {
            $table->string('id')->unique();
            $table->integer('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('payload');
            $table->integer('last_activity');
        });
        Schema::create('blog', function (Blueprint $table)
        {
            $table->increments('id');
            $table->integer('uid');
            $table->boolean('show');
            $table->text('title');
            $table->longText('content');
            $table->timestamps();
        });
        Schema::create('voice', function (Blueprint $table)
        {
            $table->string('id', 9)->unique();
            $table->integer('uid');
            $table->boolean('show')->default(1);
            $table->string('path');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('users');
        Schema::drop('sessions');
        Schema::drop('blog');
        Schema::drop('voice');
    }
}
