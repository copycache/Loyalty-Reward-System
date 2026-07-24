<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblAdmin extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_admin', function (Blueprint $table) 
        {
            $table->increments('admin_id');
            $table->string('admin_username');
            $table->string('admin_password');
            $table->string('admin_first_name');
            $table->string('admin_middle_name')->default("");
            $table->string('admin_last_name');
            $table->string('admin_email');
            $table->string('admin_contact')->default("");
            $table->integer('admin_rank_id')->default(0);
            $table->dateTime('admin_date_created');
            $table->tinyInteger('archive')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
