<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCodeTransferLogs extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_code_transfer_logs', function (Blueprint $table) 
        {   
            $table->increments('code_transfer_log_id');
            $table->integer('code_id')->unsigned();
            $table->foreign('code_id')->references('code_id')->on('tbl_codes')->onDelete('cascade');
            $table->integer('from_slot')->unsigned();
            $table->foreign('from_slot')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->integer('to_slot')->unsigned();
            $table->foreign('to_slot')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->integer('original_slot')->unsigned();
            $table->foreign('original_slot')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->dateTime('date_transfer')->nullable();
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
