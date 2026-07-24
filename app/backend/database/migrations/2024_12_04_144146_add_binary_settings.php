<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddBinarySettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_binary_settings', function (Blueprint $table) {
            $table->integer("show_earnings_tracker_per_cycle")->default(1);
            $table->integer("binary_limit_type")->default(1);
            $table->integer("binary_maximum_points_per_level_enable")->default(0);
            $table->integer("binary_maximum_slot_per_level_enable")->default(0);
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
