<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPriceAndSubtotal extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_receipt_rel_item', function (Blueprint $table) {
            $table->double("price")->default(0)->after("item_id");
            $table->double("subtotal")->default(0)->after("price");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_receipt_rel_item', function (Blueprint $table) {
            $table->dropColumn([
                'price',
                'subtotal'
            ]);
        });
    }
}
