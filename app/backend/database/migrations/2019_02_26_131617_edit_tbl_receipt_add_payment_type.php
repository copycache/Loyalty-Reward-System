<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EditTblReceiptAddPaymentType extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("tbl_receipt",function ( Blueprint $table )
        {
            $table->integer('payment_method')->nullable()->unsigned();
            $table->foreign('payment_method')->references('cashier_payment_method_id')->on('tbl_cashier_payment_method')->onDelete('cascade');
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
