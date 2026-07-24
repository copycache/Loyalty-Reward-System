<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EditTblOrdersAndTblReceiptAddRetailer extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_orders', function($table)
        {
            $table->integer('retailer')->unsigned()->nullable();
            $table->foreign('retailer')->references('branch_id')->on('tbl_branch')->onDelete('cascade');
        });

        Schema::table('tbl_receipt', function($table)
        {
            $table->integer('retailer')->unsigned()->nullable();
            $table->foreign('retailer')->references('branch_id')->on('tbl_branch')->onDelete('cascade');
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
