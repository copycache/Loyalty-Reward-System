<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblAddresses8292018332pm extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_address', function (Blueprint $table) 
        {
            $table->increments('address_id');
            $table->string('address_postal_code');
            $table->string('regCode');
            $table->string('provCode');
            $table->string('citymunCode');
            $table->string('brgyCode');
            $table->string('additional_info')->nullable();
            $table->tinyInteger('is_default')->default(0);
            $table->tinyInteger('archived')->default(0);
            $table->integer('user_id');
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
