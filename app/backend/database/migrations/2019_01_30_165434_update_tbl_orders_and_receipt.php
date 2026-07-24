<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblOrdersAndReceipt extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_orders', function (Blueprint $table) 
        {
            $table->string('buyer_address')->nullable()->after("buyer_name");
        });
        Schema::table('tbl_receipt', function (Blueprint $table) 
        {
            $table->string('buyer_address')->nullable()->after("buyer_name");
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
