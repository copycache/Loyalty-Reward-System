<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblReceiptDetails extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_receipt_details', function (Blueprint $table) 
        {
            $table->increments('receipt_details_id');
            $table->text('title')->nullable();
            $table->text('tin')->nullable();
            $table->text('details')->nullable();
            $table->text('disclaimer')->nullable();
            $table->tinyInteger('claim_code')->nullable();
            $table->tinyInteger('payment_type')->nullable();
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
