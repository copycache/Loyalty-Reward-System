<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddBinaryAutoPositionBasedOnDirect extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_binary_settings', function (Blueprint $table) {
            $table->boolean("binary_auto_placement_based_on_direct")->default(0);
            $table->integer("binary_number_of_direct_for_auto_placement")->default(0);
            $table->string("binary_priority_leg_position")->default("strong");
            $table->string("binary_default_position_without_spill")->default("left");
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
            $table->dropColumn([
                'binary_auto_placement_based_on_direct',
                'binary_number_of_direct_for_auto_placement',
                'binary_priority_leg_position',
                'binary_default_position_without_spill',
            ]);

        });
    }
}
