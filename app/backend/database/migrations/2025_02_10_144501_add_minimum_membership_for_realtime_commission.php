<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddMinimumMembershipForRealtimeCommission extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_binary_settings', function (Blueprint $table) {
            $table->integer("minimum_membership_for_realtime_commission")->default(0);
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
            $table->dropColumn('minimum_membership_for_realtime_commission');
        });
    }
}
