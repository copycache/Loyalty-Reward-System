<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblBinaryPairing extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_binary_pairing', function (Blueprint $table) 
        {
            $table->increments('binary_pairing_id');
            $table->double('binary_pairing_left')->default(0);
            $table->double('binary_pairing_right')->default(0);
            $table->double('binary_pairing_bonus')->default(0);
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
