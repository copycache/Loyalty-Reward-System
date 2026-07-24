<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblSlotTransferHistory extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_slot_transfer', function (Blueprint $table) 
        {   
            $table->increments('slot_transfer_id');
            $table->integer('owner_id');
            $table->integer('transferred_to');
            $table->integer('slot_id');
            $table->dateTime('date_transferred');
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
