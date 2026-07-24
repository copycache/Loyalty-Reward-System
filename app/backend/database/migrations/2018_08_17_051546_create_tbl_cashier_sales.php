<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCashierSales extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cashier_sales', function (Blueprint $table) 
        {
            $table->increments('cashier_sales_id');
            $table->text('items');
            $table->double('subtotal');
            $table->string('discount_type');
            $table->double('discount')->default(0);
            $table->double('change')->default(0);
            $table->integer('cashier_id');
            $table->text('payment_issued');
            $table->double('grandtotal');
            $table->dateTime('sales_date_transacted');
            $table->integer('transaction_currency');
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
