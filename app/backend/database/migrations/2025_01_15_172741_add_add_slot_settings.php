<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAddSlotSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_mlm_settings', function (Blueprint $table) {
            $table->integer("add_slot_sponsor_selection")->default(0);
            $table->integer("add_slot_automatic_sponsor")->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_mlm_settings', function (Blueprint $table) {
            $table->dropColumn(['add_slot_sponsor_selection', 'add_slot_automatic_sponsor']);
        });
    }
}
