<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAutoActivateAndTransferProductCode extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_membership', function (Blueprint $table) {
            $table->integer("membership_transfer")->default(0);
            $table->integer("product_transfer")->default(0);
            $table->integer("auto_activate_product_code")->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_membership', function (Blueprint $table) {
            $table->dropColumn([
                'membership_transfer',
                'product_transfer',
                'auto_activate_product_code'
            ]);
        });
    }
}
