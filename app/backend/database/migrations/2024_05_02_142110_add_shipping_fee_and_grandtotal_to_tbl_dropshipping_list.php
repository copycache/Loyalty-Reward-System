<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddShippingFeeAndGrandtotalToTblDropshippingList extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_dropshipping_list', function (Blueprint $table) {
            $table->double('shipping_fee')->after('subtotal')->nullable();
            $table->double('grand_total')->after('shipping_fee')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_dropshipping_list', function (Blueprint $table) {
            //
        });
    }
}
