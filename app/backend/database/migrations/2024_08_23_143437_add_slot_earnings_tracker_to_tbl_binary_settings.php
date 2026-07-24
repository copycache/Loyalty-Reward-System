<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSlotEarningsTrackerToTblBinarySettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_binary_settings', function (Blueprint $table) {
            $table->integer("show_slot_tracker")->default(1);
            $table->integer("show_earnings_tracker")->default(1);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_binary_settings', function (Blueprint $table) {
            //
        });
    }
}
