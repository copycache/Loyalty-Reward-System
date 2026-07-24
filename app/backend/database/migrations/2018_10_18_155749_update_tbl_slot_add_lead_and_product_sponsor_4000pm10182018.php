<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblSlotAddLeadAndProductSponsor4000pm10182018 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_slot', function (Blueprint $table)
        {
            $table->integer('slot_sponsor_product')->default(0)->after('slot_sponsor');
            $table->integer('slot_sponsor_member')->default(0)->after('slot_sponsor');
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
